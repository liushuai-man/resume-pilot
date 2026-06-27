import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 分析简历的 Prompt 模板
 */
export const ANALYZE_RESUME_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的面试官，擅长分析简历内容，提出有针对性的面试问题。

请分析以下简历内容，提取可以用来进行面试的关键部分。

简历内容：
{resumeContent}

请按照以下 JSON 格式回答：
{{
  "sections": [
    {{
      "key": "section_key",
      "name": "部分名称",
      "description": "为什么这部分适合提问"
    }}
  ],
  "keySkills": ["技能1", "技能2"]
}}
`.trim());
