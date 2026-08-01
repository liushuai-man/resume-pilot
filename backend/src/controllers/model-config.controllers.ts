import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { success, error, badRequest, notFound } from '../utils/response';
import {
  listModelConfigs,
  getModelConfigById,
  createModelConfig,
  updateModelConfig,
  deleteModelConfig,
  setDefaultModelConfig,
  getProviderPresets,
  testConnection,
  getDecryptedApiKey,
  CreateModelConfigRequest,
  UpdateModelConfigRequest,
} from '../services/model-config.service';

export const getPresets = async (req: AuthRequest, res: Response) => {
  try {
    const presets = getProviderPresets();
    return success(res, presets, '获取预设成功');
  } catch (err: any) {
    console.error('获取预设失败:', err);
    return error(res, `获取预设失败: ${err.message}`, 500);
  }
};
export const listConfigs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return error(res, '未登录', 401);
    }

    const configs = await listModelConfigs(userId);
    const sanitizedConfigs = configs.map((c: any) => ({
      id: c.id,
      provider: c.provider,
      modelName: c.model_name,
      displayName: c.display_name,
      baseUrl: c.base_url,
      isDefault: c.is_default,
      purpose: c.purpose,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return success(res, sanitizedConfigs, '获取列表成功');
  } catch (err: any) {
    console.error('获取模型配置列表失败:', err);
    return error(res, `获取列表失败: ${err.message}`, 500);
  }
};

export const getConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return error(res, '未登录', 401);
    }

    const config = await getModelConfigById(userId, id);
    if (!config) {
      return notFound(res, '配置不存在');
    }

    return success(
      res,
      {
        id: config.id,
        provider: config.provider,
        modelName: config.model_name,
        displayName: config.display_name,
        baseUrl: config.base_url,
      isDefault: config.is_default,
      purpose: config.purpose,
        createdAt: config.created_at,
        updatedAt: config.updated_at,
      },
      '获取成功'
    );
  } catch (err: any) {
    console.error('获取模型配置失败:', err);
    return error(res, `获取失败: ${err.message}`, 500);
  }
};

export const createConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return error(res, '未登录', 401);
    }

    const {
      provider,
      modelName,
      apiKey,
      baseUrl,
      displayName,
      isDefault,
      purpose,
    }: CreateModelConfigRequest = req.body;

    if (!provider || !modelName || !apiKey || !displayName) {
      return badRequest(res, '请填写完整的配置信息');
    }

    const connectionResult = await testConnection({
      provider,
      modelName,
      apiKey,
      baseUrl,
      purpose,
    });
    if (!connectionResult.success) {
      return badRequest(
        res,
        `连接测试失败：${connectionResult.message}，配置未保存`
      );
    }

    const config = await createModelConfig(userId, {
      provider,
      modelName,
      apiKey,
      baseUrl,
      displayName,
      isDefault,
      purpose,
    });

    return success(
      res,
      {
        id: config.id,
        provider: config.provider,
        modelName: config.model_name,
        displayName: config.display_name,
        baseUrl: config.base_url,
      isDefault: config.is_default,
      purpose: config.purpose,
        createdAt: config.created_at,
        updatedAt: config.updated_at,
      },
      '创建成功'
    );
  } catch (err: any) {
    console.error('创建模型配置失败:', err);
    return error(res, `创建失败: ${err.message}`, 500);
  }
};

export const updateConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return error(res, '未登录', 401);
    }

    const data: UpdateModelConfigRequest = req.body;
    const existingConfig = await getModelConfigById(userId, id);
    if (!existingConfig) {
      return notFound(res, '配置不存在');
    }

    const provider = data.provider ?? existingConfig.provider;
    const modelName = data.modelName ?? existingConfig.model_name;
    const displayName = data.displayName ?? existingConfig.display_name;
    const baseUrl = data.baseUrl ?? existingConfig.base_url ?? undefined;
    const purpose = data.purpose ?? (existingConfig.purpose as 'chat' | 'embedding');
    const apiKey = data.apiKey?.trim()
      ? data.apiKey.trim()
      : await getDecryptedApiKey(existingConfig);

    if (!provider || !modelName || !displayName || !apiKey) {
      return badRequest(res, '请填写完整的配置信息');
    }

    const connectionResult = await testConnection({
      provider,
      modelName,
      apiKey,
      baseUrl,
      purpose,
    });
    if (!connectionResult.success) {
      return badRequest(
        res,
        `连接测试失败：${connectionResult.message}，修改未保存`
      );
    }

    const sanitizedData = { ...data };
    if (!data.apiKey?.trim()) delete sanitizedData.apiKey;
    const config = await updateModelConfig(userId, id, sanitizedData);
    if (!config) {
      return notFound(res, '配置不存在');
    }

    return success(
      res,
      {
        id: config.id,
        provider: config.provider,
        modelName: config.model_name,
        displayName: config.display_name,
        baseUrl: config.base_url,
      isDefault: config.is_default,
      purpose: config.purpose,
        createdAt: config.created_at,
        updatedAt: config.updated_at,
      },
      '更新成功'
    );
  } catch (err: any) {
    console.error('更新模型配置失败:', err);
    return error(res, `更新失败: ${err.message}`, 500);
  }
};

export const setDefault = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return error(res, '未登录', 401);
    }

    const config = await setDefaultModelConfig(userId, id);
    if (!config) {
      return notFound(res, '配置不存在');
    }

    return success(
      res,
      {
        id: config.id,
        provider: config.provider,
        modelName: config.model_name,
        displayName: config.display_name,
        baseUrl: config.base_url,
        isDefault: config.is_default,
      },
      '设为默认成功'
    );
  } catch (err: any) {
    console.error('设为默认失败:', err);
    if (err?.message === 'ONLY_CHAT_MODEL_CAN_BE_DEFAULT') {
      return badRequest(res, '只有聊天模型可以设为默认模型');
    }
    return error(res, `设为默认失败: ${err.message}`, 500);
  }
};

export const deleteConfig = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return error(res, '未登录', 401);
    }

    const result = await deleteModelConfig(userId, id);
    if (!result) {
      return notFound(res, '配置不存在');
    }

    return success(res, null, '删除成功');
  } catch (err: any) {
    console.error('删除模型配置失败:', err);
    return error(res, `删除失败: ${err.message}`, 500);
  }
};
