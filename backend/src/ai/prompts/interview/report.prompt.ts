import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 生成面试报告的 Prompt 模板
 */
export const GENERATE_REPORT_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的HR面试官，擅长撰写面试报告，给出客观全面的评价。

请根据以下面试内容，生成一份综合面试报告。

目标岗位：{targetPosition}

简历内容：
{resumeContent}

问题和回答记录：
{qaHistory}

请按照以下 JSON 格式生成报告：
{{
  "overallScore": 85,
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["改进建议1", "改进建议2"]
}}
`.trim());
