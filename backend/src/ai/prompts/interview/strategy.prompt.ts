import { PromptTemplate } from '@langchain/core/prompts';

/**
 * 面试开始阶段：生成面试计划的 Prompt
 */
export const STRATEGY_PLAN_PROMPT = PromptTemplate.fromTemplate(`
你是一名资深面试官，擅长根据候选人简历和目标岗位制定面试计划。

目标岗位：{targetPosition}
简历内容：
{resumeContent}

请分析简历，制定面试计划。考虑以下因素：
1. 简历中提到的技术栈和项目经验
2. 目标岗位的核心技能要求
3. 各技术主题的优先级和考察题数

请按照以下 JSON 格式回答：
{{
  "interviewPlan": [
    {{
      "topic": "技术主题（如 React、Node.js、数据库等）",
      "priority": 1-10,
      "count": 建议考察题数
    }}
  ]
}}

注意：
1. 优先级越高表示越重要，需要重点考察
2. 题数总和建议在 5-10 题之间
3. 主题应该与简历和岗位相关，不要包含简历中完全没有提到的技术
4. 至少包含 3 个主题
`.trim());

/**
 * 面试过程阶段：动态调整策略的 Prompt
 */
export const STRATEGY_ADJUST_PROMPT = PromptTemplate.fromTemplate(`
你是一名资深面试官，擅长根据面试进展动态调整考察策略。

目标岗位：{targetPosition}
当前面试进度：{currentProgress}%
当前能力画像：{candidateProfile}
面试计划：{interviewPlan}
历史评估记录：
{evaluationHistory}

请根据以上信息，决定下一个考察方向。

分析要点：
1. 如果候选人在某个主题表现较弱（评分低），考虑是否需要追问深入
2. 如果候选人已经充分展示某方面的能力，可以转向其他主题
3. 参考面试计划中各主题的优先级和已考察次数
4. 难度应根据候选人表现动态调整：表现好可增加难度，表现弱可降低难度

请按照以下 JSON 格式回答：
{{
  "nextTopic": "下一个考察主题",
  "difficulty": "easy|medium|hard",
  "reason": "选择该方向的原因",
  "questionType": "technical|project|followup"
}}

questionType 说明：
- technical: 技术基础问题（八股文）
- project: 项目经验深挖
- followup: 基于上一题回答的追问（仅当上一题存在知识缺口时选择）
`.trim());
