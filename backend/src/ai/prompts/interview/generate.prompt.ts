import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 生成面试问题的 Prompt 模板
 */
export const GENERATE_QUESTIONS_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的面试官，擅长根据简历内容提出有深度的面试问题。

请根据简历的以下部分内容，生成 {count} 个面试问题。

目标岗位：{targetPosition}
部分键名：{sectionKey}
该部分内容：
{sectionContent}

请只生成问题，每个问题聚焦于该部分的一个要点。

请按照以下 JSON 格式回答：
{{
  "questions": [
    {{ "content": "问题1" }},
    {{ "content": "问题2" }}
  ]
}}
`.trim());
