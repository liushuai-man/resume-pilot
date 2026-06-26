import { OpenAI } from 'openai';
import { aiConfig } from '../config/ai';

// 根据配置创建对应的 AI 客户端
function createAIClient() {
  const config = {
    timeout: 100000, // 100 秒超时
    maxRetries: 2, // 最多重试 2 次
  };

  switch (aiConfig.provider) {
    case 'mimo':
      console.log('=== 配置 Mimo 客户端 ===');
      return new OpenAI({
        apiKey: aiConfig.mimo.apiKey,
        baseURL: aiConfig.mimo.baseURL,
        ...config,
      });
    case 'deepseek':
      console.log('使用 DeepSeek 模型');
      return new OpenAI({
        apiKey: aiConfig.deepseek.apiKey,
        baseURL: 'https://api.deepseek.com',
        ...config,
      });
    case 'openai':
    default:
      console.log('使用 OpenAI 模型');
      return new OpenAI({
        apiKey: aiConfig.openai.apiKey,
        ...config,
      });
  }
}

const aiClient = createAIClient();

export interface AICompleteRequest {
  text: string;
  context?: string;
  targetField?: string;
}

export interface AIPolishRequest {
  text: string;
  targetField?: string;
  tone?: 'professional' | 'concise' | 'creative' | 'formal';
}

/**
 * 带重试和超时的 AI 调用包装函数
 */
async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  timeoutMs = 90000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI 请求超时')), timeoutMs);
      });

      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`AI 调用失败 (尝试 ${i + 1}/${retries + 1}):`, error);

      if (i < retries) {
        // 等待一段时间后重试，指数退避
        const waitTime = Math.min(1000 * Math.pow(2, i), 3000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('AI 请求失败');
}

export async function aiComplete(request: AICompleteRequest): Promise<string> {
  const { text, context = '', targetField = '' } = request;

  const prompt = `
作为一名专业的简历助手，请根据用户提供的部分内容和上下文，帮助完成剩余内容。

用户当前正在填写简历的${targetField || '某个部分'}，已有内容：
${text}

上下文信息（如有）：
${context}

请基于已有内容和上下文，补充完整、专业的简历内容。输出时请保持自然流畅，不要添加额外的解释或说明，直接输出补全后的内容。
`.trim();

  try {
    const response = await callWithRetry(async () => {
      const model =
        aiConfig.provider === 'mimo'
          ? aiConfig.mimo.model
          : aiConfig.provider === 'deepseek'
            ? aiConfig.deepseek.model
            : aiConfig.openai.model;

      return await aiClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是一名专业的简历撰写助手，擅长用简洁、专业的语言撰写和优化简历内容。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI 补全失败:', error);
    throw new Error('AI 补全服务暂时不可用，请稍后重试');
  }
}

export async function aiPolish(request: AIPolishRequest): Promise<string> {
  const { text, targetField = '', tone = 'professional' } = request;

  const toneDescriptions = {
    professional: '专业、正式',
    concise: '简洁、精炼',
    creative: '创意、生动',
    formal: '正式、严谨',
  };

  const prompt = `
请帮我润色以下简历内容，使其更加专业和吸引人。

需要润色的内容：
${text}

适用场景：${targetField || '简历通用内容'}
目标风格：${toneDescriptions[tone]}

请保持原意不变，优化表达方式，使内容更具说服力和专业性。输出时请保持自然流畅，不要添加额外的解释或说明，直接输出润色后的内容。
`.trim();

  try {
    const response = await callWithRetry(async () => {
      const model =
        aiConfig.provider === 'mimo'
          ? aiConfig.mimo.model
          : aiConfig.provider === 'deepseek'
            ? aiConfig.deepseek.model
            : aiConfig.openai.model;

      return await aiClient.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content:
              '你是一名专业的简历润色专家，擅长优化简历内容，使其更具专业性和吸引力。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI 润色失败:', error);
    throw new Error('AI 润色服务暂时不可用，请稍后重试');
  }
}
