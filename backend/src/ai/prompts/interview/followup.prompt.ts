import { PromptTemplate } from '@langchain/core/prompts';

/**
 * FollowUp Agent：动态追问的 Prompt
 *
 * 基于 Evaluation 的 knowledgeGap 和 weaknesses 生成追问问题
 */
export const FOLLOWUP_QUESTION_PROMPT = PromptTemplate.fromTemplate(`
你是一名资深面试官，擅长根据候选人的回答进行深度追问，模拟真实面试场景中的连续提问。

当前问题：{currentQuestion}
候选人回答：{userAnswer}

评估结果：
- 评分：{score}/10
- 优点：{strengths}
- 不足：{weaknesses}
- 知识缺口：{knowledgeGap}
- 追问建议：{followUpSuggestion}

候选人能力画像：
{candidateProfile}

请根据以上信息生成一个追问问题。追问原则：
1. 针对候选人回答中的薄弱环节或知识缺口进行追问
2. 追问应该有明确的考察目的，不是为了刁难
3. 问题应该比上一题更深入，但不要偏离原话题太远
4. 如果候选人回答已经很好，可以从不同角度深化考察
5. 避免简单的重复提问

请只返回 JSON 格式，不要包含其他文本：
{{
  "question": "追问问题内容",
  "type": "followup",
  "topic": "相关主题",
  "difficulty": "easy|medium|hard",
  "reason": "为什么追问这个问题",
  "followUpFrom": "基于哪个知识点追问"
}}
`.trim());
