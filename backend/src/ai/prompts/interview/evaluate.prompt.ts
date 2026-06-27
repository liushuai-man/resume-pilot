import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 评估面试回答的 Prompt 模板
 */
export const EVALUATE_ANSWER_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的面试官，擅长评估面试回答并给出改进建议。

请评估以下面试回答：

问题：{question}
用户回答：{answer}
简历相关内容：
{resumeSectionContent}

请从以下几个方面评估（1-10分）：
1. 回答的准确性
2. 内容的完整性
3. 专业性

请按照以下 JSON 格式回答：
{{
  "score": 7,
  "feedback": "具体的反馈建议"
}}
`.trim());
