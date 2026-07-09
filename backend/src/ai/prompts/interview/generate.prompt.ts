import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 生成面试问题的 Prompt 模板
 */
export const GENERATE_QUESTIONS_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的面试官，擅长根据简历内容提出有深度的面试问题。

请根据简历内容和之前的问答历史，生成 {count} 个面试问题。

目标岗位：{targetPosition}
简历内容：
{resumeContent}

{qaHistorySection}

要求：
1. 问题应该基于简历内容和候选人之前的回答，进行深入追问或探索新领域
2. 如果有之前的问答历史，问题应该与之前的回答相关，可以是追问、澄清或扩展
3. 如果没有问答历史，这是第一个问题，请从简历的核心内容开始
4. 问题应该具有针对性和专业性，能够有效评估候选人的能力

请只返回 JSON 格式，不要包含其他文本：
{{
  "questions": [
    {{ "content": "问题1" }},
    {{ "content": "问题2" }}
  ]
}}
`.trim());
