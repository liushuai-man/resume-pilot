import { ChatOpenAI } from '@langchain/openai';
import { aiConfig } from '../../config/ai';
import { getDefaultModelConfig } from '../../services/model-config.service';

export function createLLM(options?: {
  temperature?: number;
  maxTokens?: number;
}) {
  const { temperature = 0.7, maxTokens = 1000 } = options || {};

  let baseURL: string | undefined;
  let apiKeyValue: string;
  let modelName: string;

  switch (aiConfig.provider) {
    case 'mimo':
      baseURL = aiConfig.mimo.baseURL;
      apiKeyValue = aiConfig.mimo.apiKey || '';
      modelName = aiConfig.mimo.model;
      console.log('使用 Mimo 模型:', modelName);
      break;
    case 'deepseek':
      baseURL = 'https://api.deepseek.com';
      apiKeyValue = aiConfig.deepseek.apiKey || '';
      modelName = aiConfig.deepseek.model;
      console.log('使用 DeepSeek 模型:', modelName);
      break;
    case 'openai':
    default:
      apiKeyValue = aiConfig.openai.apiKey || '';
      modelName = aiConfig.openai.model;
      console.log('使用 OpenAI 模型:', modelName);
      break;
  }

  process.env.OPENAI_API_KEY = apiKeyValue;
  if (baseURL) {
    process.env.OPENAI_BASE_URL = baseURL;
  }

  return new ChatOpenAI({
    modelName,
    temperature,
    maxTokens,
    timeout: 100000,
  });
}

export async function createUserLLM(
  userId?: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
) {
  const { temperature = 0.7, maxTokens = 1000 } = options || {};

  if (userId) {
    try {
      const userConfig = await getDefaultModelConfig(userId);
      if (userConfig) {
        console.log(`用户 ${userId} 使用自定义模型: ${userConfig.provider}/${userConfig.model_name}`);
        return new ChatOpenAI({
          modelName: userConfig.model_name,
          temperature,
          maxTokens,
          timeout: 100000,
          configuration: {
            apiKey: userConfig.api_key,
            baseURL: userConfig.base_url || undefined,
          },
        });
      }
    } catch (error) {
      console.warn('获取用户模型配置失败，使用全局默认模型:', error);
    }
  }

  return createLLM({ temperature, maxTokens });
}
