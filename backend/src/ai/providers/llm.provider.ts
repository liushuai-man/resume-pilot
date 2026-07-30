import { ChatOpenAI } from '@langchain/openai';
import { getDefaultModelConfig } from '../../services/model-config.service';

export async function getUserModelClientConfig(userId?: string) {
  if (!userId) throw new Error('需要登录后才能使用 AI 功能');

  const config = await getDefaultModelConfig(userId);
  if (!config) {
    throw new Error('请先在模型管理中添加并设为默认模型');
  }

  return config;
}

export async function createUserLLM(
  userId?: string,
  options?: { temperature?: number; maxTokens?: number }
) {
  const { temperature = 0.7, maxTokens = 1000 } = options || {};
  const config = await getUserModelClientConfig(userId);

  return new ChatOpenAI({
    modelName: config.model_name,
    temperature,
    maxTokens,
    timeout: 100000,
    configuration: {
      apiKey: config.api_key,
      baseURL: config.base_url || undefined,
    },
  });
}
