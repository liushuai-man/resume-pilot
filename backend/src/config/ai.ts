import { env } from './env'

export const aiConfig = {
  provider: env.AI_PROVIDER,
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: 'gpt-4o',
  },
  deepseek: {
    apiKey: env.DEEPSEEK_API_KEY,
    model: 'deepseek-chat',
  },
  rateLimit: {
    requestsPerMinute: 60,
    tokensPerDay: 10000,
  },
}
