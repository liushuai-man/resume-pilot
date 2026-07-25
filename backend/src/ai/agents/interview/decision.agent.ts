import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { STRATEGY_PLAN_PROMPT } from '../../prompts/interview/strategy.prompt';
import { NEXT_QUESTION_PROMPT } from '../../prompts/interview/next-question.prompt';
import {
  Question,
  LangGraphInterviewState,
  InterviewPlanItem,
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

export class InterviewDecisionAgent {
  async generateInterviewPlan(
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
      console.error('InterviewDecisionAgent 生成面试计划失败:', error);
      return [];
    }
  }

  async generateNextQuestion(
    state: LangGraphInterviewState
  ): Promise<Question> {
    const llm = await createUserLLM(state.userId, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const chain = RunnableSequence.from([
      NEXT_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const qaHistory = state.questions
      .map((q, i) => {
        const answer = state.answers[i];
        const evaluation = state.evaluations[i];
        if (!answer) return '';
        const score = evaluation?.score || 0;
        return `问题${i + 1}: ${q.content}\n回答: ${answer.content}\n评分: ${score}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const currentProgress = Math.round(
      (state.currentQuestionIndex / state.maxQuestions) * 100
    );

    try {
      const result = await chain.invoke({
        targetPosition: state.targetPosition,
        resumeContent: state.resumeText,
        currentProgress: currentProgress.toString(),
        candidateProfile: JSON.stringify(state.profile, null, 2),
        interviewPlan: JSON.stringify(state.interviewPlan, null, 2),
        qaHistory: qaHistory || '暂无问答记录',
      });

      const parsed = JSON.parse(cleanJson(result));

      let section = 'skills';
      let sectionKey = 'skills';

      if (parsed.type === 'project') {
        section = 'projects';
        sectionKey = 'projects';
      } else if (parsed.type === 'followup') {
        const lastQuestion = state.questions[state.questions.length - 1];
        section = lastQuestion?.section || 'general';
        sectionKey = lastQuestion?.sectionKey || 'general';
      }

      return {
        id: `q-${Date.now()}-${parsed.type || 'technical'}`,
        content: parsed.question,
        section,
        sectionKey,
        type: parsed.type || 'technical',
        topic: parsed.topic || '综合技术',
        difficulty: parsed.difficulty || 'medium',
        projectName: parsed.projectName || '',
      };
    } catch (error) {
      console.error('InterviewDecisionAgent 生成下一题失败:', error);
      return {
        id: `q-${Date.now()}-default`,
        content: '请谈谈你在工作中遇到的最大技术挑战以及你是如何解决的。',
        section: 'general',
        sectionKey: 'general',
        type: 'technical',
        topic: '综合技术',
        difficulty: 'medium',
      };
    }
  }
}