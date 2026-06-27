import { PromptTemplate } from '@langchain/core/prompts';

/**
 * AI 内容润色的 Prompt 模板
 */
export const POLISH_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的简历润色专家，擅长优化简历内容，使其更具专业性和吸引力。

请帮我润色以下简历内容，使其更加专业和吸引人。

需要润色的内容：
{text}

适用场景：{targetField}
目标风格：{toneDescription}

请保持原意不变，优化表达方式，使内容更具说服力和专业性。

输出要求：
- 保持自然流畅
- 不要添加额外的解释或说明
- 直接输出润色后的内容
`.trim());

export const TONE_DESCRIPTIONS = {
  professional: '专业、正式',
  concise: '简洁、精炼',
  creative: '创意、生动',
  formal: '正式、严谨',
};
