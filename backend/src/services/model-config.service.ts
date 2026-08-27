import { prisma } from '../database/prisma';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import {
  decryptSecret,
  encryptSecret,
  isEncryptedSecret,
} from '../utils/secret-crypto';

export interface CreateModelConfigRequest {
  provider: string;
  modelName: string;
  apiKey: string;
  baseUrl?: string;
  displayName: string;
  isDefault?: boolean;
  purpose?: 'chat' | 'embedding';
}

export interface UpdateModelConfigRequest {
  provider?: string;
  modelName?: string;
  apiKey?: string;
  baseUrl?: string;
  displayName?: string;
  isDefault?: boolean;
  purpose?: 'chat' | 'embedding';
}

const PROVIDER_PRESETS: Record<
  string,
  { baseUrl: string; defaultModel: string }
> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
  },
  mimo: {
    baseUrl: 'https://api.xiaomimimo.com/v1',
    defaultModel: 'mimo-v2.5',
  },
  zhipu: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4',
  },
  qwen: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-plus',
  },
  custom: {
    baseUrl: '',
    defaultModel: '',
  },
};

const CONNECTION_TEST_TIMEOUT_MS = 15000;

async function withConnectionTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error('MODEL_CONNECTION_TIMEOUT')),
      CONNECTION_TEST_TIMEOUT_MS
    );
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function getProviderPresets() {
  return Object.entries(PROVIDER_PRESETS).map(([key, value]) => ({
    provider: key,
    baseUrl: value.baseUrl,
    defaultModel: value.defaultModel,
  }));
}

export async function listModelConfigs(userId: string) {
  return await prisma.userModelConfig.findMany({
    where: { user_id: userId, is_deleted: false },
    orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
  });
}

export async function getDefaultModelConfig(userId: string) {
  return await prisma.userModelConfig.findFirst({
    where: {
      user_id: userId,
      is_deleted: false,
      is_default: true,
      purpose: 'chat',
    },
  });
}

export async function getEmbeddingModelConfig(userId: string) {
  return await prisma.userModelConfig.findFirst({
    where: { user_id: userId, is_deleted: false, purpose: 'embedding' },
    orderBy: { updated_at: 'desc' },
  });
}

export async function getModelConfigById(userId: string, configId: string) {
  return await prisma.userModelConfig.findFirst({
    where: { id: configId, user_id: userId, is_deleted: false },
  });
}

export async function createModelConfig(
  userId: string,
  data: CreateModelConfigRequest
) {
  const purpose = data.purpose || 'chat';
  const existingConfigs = await prisma.userModelConfig.count({
    where: { user_id: userId, is_deleted: false, purpose },
  });

  const isFirstConfig = existingConfigs === 0;
  const shouldBeDefault =
    purpose === 'chat' && (data.isDefault || isFirstConfig);

  if (shouldBeDefault) {
    await prisma.userModelConfig.updateMany({
      where: { user_id: userId, is_deleted: false, purpose: 'chat' },
      data: { is_default: false },
    });
  }

  return await prisma.userModelConfig.create({
    data: {
      user_id: userId,
      provider: data.provider,
      model_name: data.modelName,
      api_key: encryptSecret(data.apiKey),
      base_url: data.baseUrl || null,
      display_name: data.displayName,
      purpose,
      is_default: shouldBeDefault,
    },
  });
}

export async function updateModelConfig(
  userId: string,
  configId: string,
  data: UpdateModelConfigRequest
) {
  const config = await prisma.userModelConfig.findFirst({
    where: { id: configId, user_id: userId, is_deleted: false },
  });

  if (!config) {
    return null;
  }

  const nextPurpose = data.purpose || config.purpose;
  if (data.isDefault) {
    if (nextPurpose !== 'chat') {
      throw new Error('ONLY_CHAT_MODEL_CAN_BE_DEFAULT');
    }
    await prisma.userModelConfig.updateMany({
      where: { user_id: userId, is_deleted: false, purpose: 'chat' },
      data: { is_default: false },
    });
  }

  const updateData: any = {};
  if (data.provider !== undefined) updateData.provider = data.provider;
  if (data.modelName !== undefined) updateData.model_name = data.modelName;
  if (data.apiKey !== undefined)
    updateData.api_key = encryptSecret(data.apiKey);
  if (data.baseUrl !== undefined) updateData.base_url = data.baseUrl || null;
  if (data.displayName !== undefined)
    updateData.display_name = data.displayName;
  if (data.purpose !== undefined) updateData.purpose = data.purpose;
  if (data.isDefault !== undefined) updateData.is_default = data.isDefault;
  if (nextPurpose !== 'chat') updateData.is_default = false;

  return await prisma.userModelConfig.update({
    where: { id: configId },
    data: updateData,
  });
}

export async function getDecryptedApiKey(config: {
  id: string;
  api_key: string;
}) {
  const apiKey = decryptSecret(config.api_key);
  // Transparent one-time migration for configurations created before encryption.
  if (!isEncryptedSecret(config.api_key)) {
    await prisma.userModelConfig.update({
      where: { id: config.id },
      data: { api_key: encryptSecret(apiKey) },
    });
  }
  return apiKey;
}

export async function setDefaultModelConfig(userId: string, configId: string) {
  const config = await prisma.userModelConfig.findFirst({
    where: { id: configId, user_id: userId, is_deleted: false },
  });

  if (!config) {
    return null;
  }

  if (config.purpose !== 'chat') {
    throw new Error('ONLY_CHAT_MODEL_CAN_BE_DEFAULT');
  }

  await prisma.userModelConfig.updateMany({
    where: { user_id: userId, is_deleted: false, purpose: 'chat' },
    data: { is_default: false },
  });

  return await prisma.userModelConfig.update({
    where: { id: configId },
    data: { is_default: true },
  });
}

export async function deleteModelConfig(userId: string, configId: string) {
  const config = await prisma.userModelConfig.findFirst({
    where: { id: configId, user_id: userId, is_deleted: false },
  });

  if (!config) {
    return null;
  }

  await prisma.userModelConfig.update({
    where: { id: configId },
    data: { is_deleted: true },
  });

  if (config.is_default) {
    const nextConfig = await prisma.userModelConfig.findFirst({
      where: { user_id: userId, is_deleted: false, purpose: 'chat' },
      orderBy: { created_at: 'asc' },
    });
    if (nextConfig) {
      await prisma.userModelConfig.update({
        where: { id: nextConfig.id },
        data: { is_default: true },
      });
    }
  }

  return true;
}

export async function testConnection(data: {
  provider: string;
  modelName: string;
  apiKey: string;
  baseUrl?: string;
  purpose?: 'chat' | 'embedding';
}) {
  try {
    if (data.purpose === 'embedding') {
      const embeddings = new OpenAIEmbeddings({
        modelName: data.modelName,
        openAIApiKey: data.apiKey,
        timeout: 15000,
        configuration: {
          baseURL: data.baseUrl || undefined,
        },
      });
      const vector = await withConnectionTimeout(
        embeddings.embedQuery('连接测试')
      );
      if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error('向量模型未返回有效向量');
      }
      return {
        success: true,
        message: `连接成功，向量维度 ${vector.length}`,
        model: data.modelName,
        response: `${vector.length} dimensions`,
      };
    }

    const llm = new ChatOpenAI({
      modelName: data.modelName,
      openAIApiKey: data.apiKey,
      temperature: 0.7,
      maxTokens: 100,
      timeout: 15000,
      configuration: {
        baseURL: data.baseUrl || undefined,
      },
    });

    const result = await withConnectionTimeout(llm.invoke('ping'));
    const responseContent =
      typeof result.content === 'string'
        ? result.content.substring(0, 50)
        : JSON.stringify(result.content).substring(0, 50);
    return {
      success: true,
      message: '连接成功',
      model: data.modelName,
      response: responseContent || 'OK',
    };
  } catch (error: any) {
    let message = '连接失败';
    if (error.message) {
      if (
        error.message.includes('401') ||
        error.message.includes('invalid_api_key')
      ) {
        message = 'API Key 无效';
      } else if (error.message.includes('403')) {
        message = '权限不足';
      } else if (error.message.includes('404')) {
        message = '模型不存在';
      } else if (
        error.message.includes('timeout') ||
        error.message.includes('MODEL_CONNECTION_TIMEOUT')
      ) {
        message = '连接超时';
      } else if (error.message.includes('ETIMEDOUT')) {
        message = '网络连接超时';
      } else {
        message = error.message.substring(0, 100);
      }
    }
    return {
      success: false,
      message,
    };
  }
}
