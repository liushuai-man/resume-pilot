import { env } from './env';

// 规范化 provider 名称
const normalizeProvider = (provider: string) => {
  const p = provider.toLowerCase().trim();
  if (p.includes('mimo') || p.includes('xiaomi')) return 'mimo';
  if (p.includes('deepseek')) return 'deepseek';
  return 'openai';
};



export const aiConfig = {
  provider: normalizeProvider(env.AI_PROVIDER),
  originalProvider: env.AI_PROVIDER,
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: 'gpt-4o',
  },
  deepseek: {
    apiKey: env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
  },
  mimo: {
    apiKey: env.MIMO_API_KEY || env.OPENAI_API_KEY,
    baseURL: env.MIMO_API_BASE_URL || 'https://api.xiaomimimo.com/v1',
    model: 'mimo-v2.5',
  },
  rateLimit: {
    requestsPerMinute: 60,
    tokensPerDay: 10000,
  },
};
