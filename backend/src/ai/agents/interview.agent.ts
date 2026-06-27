import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createLLM } from '../providers/llm.provider';
import { ANALYZE_RESUME_PROMPT } from '../prompts/interview/analyze.prompt';
import { GENERATE_QUESTIONS_PROMPT } from '../prompts/interview/generate.prompt';
import { EVALUATE_ANSWER_PROMPT } from '../prompts/interview/evaluate.prompt';
import { GENERATE_REPORT_PROMPT } from '../prompts/interview/report.prompt';
import {
  InterviewState,
  Question,
  Answer,
  Evaluation,
} from '../types/interview.types';

export class InterviewAgent {
  private llm = createLLM({ temperature: 0.7, maxTokens: 1000 });

  /**
   * 分析简历内容
   */
  private async analyzeResume(resumeContent: any): Promise<{
    sections: { key: string; name: string; description: string }[];
    keySkills: string[];
  }> {
    const chain = RunnableSequence.from([
      ANALYZE_RESUME_PROMPT,
      this.llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        resumeContent: JSON.stringify(resumeContent, null, 2),
      });
      return JSON.parse(result);
    } catch (error) {
      console.error('简历分析失败:', error);
      return {
        sections: [],
        keySkills: [],
      };
    }
  }

  /**
   * 生成面试问题
   */
  private async generateQuestions(
    resumeContent: any,
    sectionKey: string,
    targetPosition: string = '通用岗位',
    count: number = 2
  ): Promise<Question[]> {
    const sectionContent = JSON.stringify(
      resumeContent[sectionKey] || {},
      null,
      2
    );

    const chain = RunnableSequence.from([
      GENERATE_QUESTIONS_PROMPT,
      this.llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        sectionKey,
        sectionContent,
        targetPosition,
        count: count.toString(),
      });
      const parsed = JSON.parse(result);
      return parsed.questions.map((q: any, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        content: q.content,
        section: sectionKey,
        sectionKey,
      }));
    } catch (error) {
      console.error('问题生成失败:', error);
      return [];
    }
  }

  /**
   * 评估回答
   */
  private async evaluateAnswer(
    question: Question,
    answer: string,
    resumeContent: any
  ): Promise<Evaluation> {
    const resumeSectionContent = JSON.stringify(
      resumeContent[question.sectionKey] || {},
      null,
      2
    );

    const chain = RunnableSequence.from([
      EVALUATE_ANSWER_PROMPT,
      this.llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        question: question.content,
        answer,
        resumeSectionContent,
      });
      const parsed = JSON.parse(result);
      return {
        questionId: question.id,
        score: parsed.score,
        feedback: parsed.feedback,
      };
    } catch (error) {
      console.error('回答评估失败:', error);
      return {
        questionId: question.id,
        score: 5,
        feedback: '需要改进',
      };
    }
  }

  /**
   * 生成最终报告
   */
  private async generateFinalReport(
    resumeContent: any,
    questions: Question[],
    answers: Answer[],
    evaluations: Evaluation[],
    targetPosition: string = '通用岗位'
  ): Promise<any> {
    const qaHistory = questions
      .map((q, i) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const evaluation = evaluations.find((e) => e.questionId === q.id);
        return `
问题 ${i + 1}: ${q.content}
回答: ${answer?.content || '未回答'}
评分: ${evaluation?.score || 0}
反馈: ${evaluation?.feedback || ''}
`;
      })
      .join('\n');

    const chain = RunnableSequence.from([
      GENERATE_REPORT_PROMPT,
      this.llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        targetPosition,
        resumeContent: JSON.stringify(resumeContent, null, 2),
        qaHistory,
      });
      return JSON.parse(result);
    } catch (error) {
      console.error('报告生成失败:', error);
      return {
        overallScore: 60,
        strengths: [],
        weaknesses: [],
        suggestions: [],
      };
    }
  }

  /**
   * 开始面试
   */
  async startInterview(
    resumeId: string,
    resumeContent: any,
    targetPosition?: string
  ): Promise<{
    sessionData: InterviewState;
    firstQuestion: Question;
  }> {
    console.log('=== 初始化面试 ===');
    const analysis = await this.analyzeResume(resumeContent);

    // 确定要提问的主要部分
    let mainSection = 'basicInfo';
    const sectionsToTry = [
      'experience',
      'projects',
      'skills',
      'education',
      'basicInfo',
    ];

    for (const section of sectionsToTry) {
      const hasContent =
        resumeContent[section] &&
        (Array.isArray(resumeContent[section])
          ? resumeContent[section].length > 0
          : Object.keys(resumeContent[section]).length > 0);
      if (hasContent) {
        mainSection = section;
        break;
      }
    }

    // 生成初始问题
    const questions = await this.generateQuestions(
      resumeContent,
      mainSection,
      targetPosition || '通用岗位'
    );

    // 如果没有生成问题，创建默认问题
    if (questions.length === 0) {
      questions.push({
        id: `q-${Date.now()}-0`,
        content: '请简单介绍一下你自己和你的主要工作经历。',
        section: mainSection,
        sectionKey: mainSection,
      });
    }

    const sessionData: InterviewState = {
      resumeId,
      resumeContent,
      targetPosition: targetPosition || '通用岗位',
      currentSection: mainSection,
      questions,
      answers: [],
      evaluations: [],
      currentQuestionIndex: 0,
      isFinished: false,
    };

    return {
      sessionData,
      firstQuestion: questions[0],
    };
  }

  /**
   * 提交回答并获取下一步
   */
  async submitAnswer(
    state: InterviewState,
    answer: string
  ): Promise<{
    feedback: string;
    nextQuestion: Question | null;
    isFinished: boolean;
    report?: any;
  }> {
    const newAnswer: Answer = {
      questionId: state.questions[state.currentQuestionIndex].id,
      content: answer,
    };

    // 评估回答
    const evaluateResult = await this.evaluateAnswer(
      state.questions[state.currentQuestionIndex],
      answer,
      state.resumeContent
    );

    const newEvaluations = [...state.evaluations, evaluateResult];
    const newIndex = state.currentQuestionIndex + 1;
    const isFinished = newIndex >= Math.min(state.questions.length + 1, 5);

    let nextQuestion: Question | null = null;
    let finalReport = null;

    if (isFinished) {
      // 生成报告
      finalReport = await this.generateFinalReport(
        state.resumeContent,
        [...state.questions],
        [...state.answers, newAnswer],
        newEvaluations,
        state.targetPosition
      );
    } else {
      // 生成下一个问题
      const sections = [
        'experience',
        'projects',
        'skills',
        'education',
        'basicInfo',
      ];
      const currentSectionIndex = sections.indexOf(state.currentSection);
      const nextSection = sections[(currentSectionIndex + 1) % sections.length];

      const newQuestions = await this.generateQuestions(
        state.resumeContent,
        nextSection,
        state.targetPosition,
        1
      );

      if (newQuestions.length > 0) {
        nextQuestion = newQuestions[0];
      } else if (newIndex < state.questions.length) {
        nextQuestion = state.questions[newIndex];
      }
    }

    return {
      feedback: evaluateResult.feedback,
      nextQuestion,
      isFinished,
      report: finalReport,
    };
  }
}

export const interviewAgent = new InterviewAgent();
