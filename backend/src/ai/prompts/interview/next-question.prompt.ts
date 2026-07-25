import { PromptTemplate } from '@langchain/core/prompts';

export const NEXT_QUESTION_PROMPT = PromptTemplate.fromTemplate(`
你是一名资深面试官，擅长根据面试进展动态调整考察策略并生成问题。

目标岗位：{targetPosition}

简历内容：
{resumeContent}

当前面试进度：{currentProgress}%

候选人能力画像：
{candidateProfile}

面试计划：
{interviewPlan}

历史问答记录：
{qaHistory}

请根据以上信息，直接生成下一个面试问题。

分析要点：
1. 如果候选人在某个主题表现较弱（评分低），考虑是否需要追问深入
2. 如果候选人已经充分展示某方面的能力，可以转向其他主题
3. 参考面试计划中各主题的优先级和已考察次数
4. 难度应根据候选人表现动态调整：表现好可增加难度，表现弱可降低难度
5. 如果上一题存在知识缺口，可以进行追问

请只返回 JSON 格式，不要包含其他文本：
{{
  "question": "下一个问题内容",
  "type": "technical|project|followup",
  "topic": "相关主题",
  "difficulty": "easy|medium|hard",
  "reason": "选择该问题的原因",
  "projectName": "如果是项目问题，填写项目名称，否则为空字符串"
}}

类型说明：
- technical: 技术基础问题（八股文）
- project: 项目经验深挖
- followup: 基于上一题回答的追问

难度说明：
- easy: 基础概念
- medium: 原理理解
- hard: 深度分析
`.trim());
