import { OpenAI } from 'openai';
import { aiConfig } from '../config/ai';

const openai = new OpenAI({
  apiKey: aiConfig.openai.apiKey,
});

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

  const response = await openai.chat.completions.create({
    model: aiConfig.openai.model,
    messages: [
      {
        role: 'system',
        content: '你是一名专业的简历撰写助手，擅长用简洁、专业的语言撰写和优化简历内容。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content?.trim() || '';
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

  const response = await openai.chat.completions.create({
    model: aiConfig.openai.model,
    messages: [
      {
        role: 'system',
        content: '你是一名专业的简历润色专家，擅长优化简历内容，使其更具专业性和吸引力。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content?.trim() || '';
}