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

{introductionSection}

请按照以下 JSON 格式生成报告：
{{
  "overallScore": 85,
  "introductionEvaluation": "对自我介绍的评价（如果候选人选择跳过，则说明跳过自我介绍可能给面试官留下的印象）",
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["改进建议1", "改进建议2"]
}}

注意：
1. overallScore 为 0-100 的整数
2. 如果候选人有自我介绍，请在introductionEvaluation中评价其表达能力、逻辑性和完整性
3. 如果候选人跳过自我介绍，请在introductionEvaluation中说明这可能影响面试印象
4. strengths、weaknesses、suggestions 数组至少包含1项
`.trim());
