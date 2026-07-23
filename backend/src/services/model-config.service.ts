import { prisma } from '../database/prisma';
import { ChatOpenAI } from '@langchain/openai';

export interface CreateModelConfigRequest {
  provider: string;
  modelName: string;
  apiKey: string;
  baseUrl?: string;
  displayName: string;
  isDefault?: boolean;
}

export interface UpdateModelConfigRequest {
  provider?: string;
  modelName?: string;
  apiKey?: string;
  baseUrl?: string;
  displayName?: string;
  isDefault?: boolean;
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
    where: { user_id: userId, is_deleted: false, is_default: true },
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
  const existingConfigs = await prisma.userModelConfig.count({
    where: { user_id: userId, is_deleted: false },
  });

  const isFirstConfig = existingConfigs === 0;
  const shouldBeDefault = data.isDefault || isFirstConfig;

  if (shouldBeDefault) {
    await prisma.userModelConfig.updateMany({
      where: { user_id: userId, is_deleted: false },
      data: { is_default: false },
    });
  }

  return await prisma.userModelConfig.create({
    data: {
      user_id: userId,
      provider: data.provider,
      model_name: data.modelName,
      api_key: data.apiKey,
      base_url: data.baseUrl || null,
      display_name: data.displayName,
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

  if (data.isDefault) {
    await prisma.userModelConfig.updateMany({
      where: { user_id: userId, is_deleted: false },
      data: { is_default: false },
    });
  }

  const updateData: any = {};
  if (data.provider !== undefined) updateData.provider = data.provider;
  if (data.modelName !== undefined) updateData.model_name = data.modelName;
  if (data.apiKey !== undefined) updateData.api_key = data.apiKey;
  if (data.baseUrl !== undefined) updateData.base_url = data.baseUrl || null;
  if (data.displayName !== undefined)
    updateData.display_name = data.displayName;
  if (data.isDefault !== undefined) updateData.is_default = data.isDefault;

  return await prisma.userModelConfig.update({
    where: { id: configId },
    data: updateData,
  });
}

export async function setDefaultModelConfig(userId: string, configId: string) {
  const config = await prisma.userModelConfig.findFirst({
    where: { id: configId, user_id: userId, is_deleted: false },
  });

  if (!config) {
    return null;
  }

  await prisma.userModelConfig.updateMany({
    where: { user_id: userId, is_deleted: false },
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
      where: { user_id: userId, is_deleted: false },
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
}) {
  try {
    const llm = new ChatOpenAI({
      modelName: data.modelName,
      temperature: 0.7,
      maxTokens: 100,
      timeout: 15000,
      configuration: {
        apiKey: data.apiKey,
        baseURL: data.baseUrl || undefined,
      },
    });

    const result = await llm.invoke('ping');
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
      } else if (error.message.includes('timeout')) {
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
