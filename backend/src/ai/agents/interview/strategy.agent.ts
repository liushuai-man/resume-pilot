import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import {
  STRATEGY_PLAN_PROMPT,
  STRATEGY_ADJUST_PROMPT,
} from '../../prompts/interview/strategy.prompt';
import {
  LangGraphInterviewState,
  InterviewPlanItem,
  Strategy,
} from '../../types/interview.types';
import { getResumeText } from './utils';

function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```'))
    cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

export class StrategyAgent {
  async generatePlan(
    resumeContent: any,
    targetPosition: string,
    userId?: string
  ): Promise<InterviewPlanItem[]> {
    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 1500,
    });

    const chain = RunnableSequence.from([
      STRATEGY_PLAN_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        targetPosition,
        resumeContent: getResumeText(resumeContent),
      });

      const parsed = JSON.parse(cleanJson(result));
      return (parsed.interviewPlan || []).map((item: any) => ({
        topic: item.topic,
        priority: item.priority,
        count: item.count,
        askedCount: 0,
      }));
    } catch (error) {
      console.error('Strategy Agent 生成面试计划失败:', error);
      return [];
    }
  }

  async adjustStrategy(
    state: LangGraphInterviewState,
    userId?: string
  ): Promise<Strategy> {
    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 1000,
    });

    const chain = RunnableSequence.from([
      STRATEGY_ADJUST_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const evaluationHistory = state.evaluations
      .map((e, i) => {
        const q = state.questions[i];
        return `问题${i + 1}: ${q?.content || ''}\n评分: ${e.score}\n反馈: ${e.feedback}\n知识缺口: ${e.knowledgeGap?.join(', ') || '无'}`;
      })
      .join('\n\n');

    const currentProgress = Math.round(
      (state.currentQuestionIndex / state.maxQuestions) * 100
    );

    try {
      const result = await chain.invoke({
        targetPosition: state.targetPosition,
        currentProgress: currentProgress.toString(),
        candidateProfile: JSON.stringify(state.profile, null, 2),
        interviewPlan: JSON.stringify(state.interviewPlan, null, 2),
        evaluationHistory: evaluationHistory || '暂无评估记录',
      });

      const parsed = JSON.parse(cleanJson(result));
      return {
        nextTopic: parsed.nextTopic,
        difficulty: parsed.difficulty,
        reason: parsed.reason,
        questionType: parsed.questionType,
      };
    } catch (error) {
      console.error('Strategy Agent 调整策略失败:', error);
      const nextPlanItem = state.interviewPlan.find(
        (p) => p.askedCount < p.count
      );
      return {
        nextTopic: nextPlanItem?.topic || '综合技术',
        difficulty: 'medium',
        reason: '降级策略：按计划顺序考察',
        questionType: 'technical',
      };
    }
  }
}
