import { ChatOpenAI } from '@langchain/openai';
import { aiConfig } from '../../config/ai';

/**
 * 创建兼容多种供应商的 LangChain LLM 实例
 */
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

  // 设置环境变量供 LangChain 使用
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
