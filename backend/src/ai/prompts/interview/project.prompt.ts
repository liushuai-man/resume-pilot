import { PromptTemplate } from '@langchain/core/prompts';

export const PROJECT_QUESTION_PROMPT = PromptTemplate.fromTemplate(`
你是一名专业的技术面试官，擅长提问项目经验相关问题。

请根据简历中的项目经验生成 {count} 个项目相关的面试问题，包括：
- 项目背景和目标
- 技术选型和架构设计
- 个人职责和贡献
- 遇到的技术挑战和解决方案
- 项目亮点和创新点
- 项目中的技术细节

目标岗位：{targetPosition}
当前考察主题：{topic}
难度要求：{difficulty}
简历内容：
{resumeContent}

已问过的问题：
{askedQuestions}

要求：
1. 问题必须基于简历中提到的项目，深入挖掘项目细节
2. 问题要有针对性，能够了解候选人在项目中的真实贡献
3. 避免重复提问
4. 优先选择简历中描述最详细的项目进行提问
5. 难度要求：easy（项目概述）、medium（技术细节）、hard（架构决策和权衡）
6. 如果指定了考察主题 {topic}，问题应尽量与该主题相关

请只返回 JSON 格式，不要包含其他文本：
{{
  "questions": [
    {{
      "content": "问题内容",
      "type": "project",
      "topic": "相关主题",
      "difficulty": "easy|medium|hard",
      "projectName": "相关项目名称"
    }}
  ]
}}
`.trim());
