import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../providers/llm.provider';
import { ANALYZE_RESUME_PROMPT } from '../prompts/interview/analyze.prompt';
import { BA_GU_QUESTION_PROMPT } from '../prompts/interview/bagu.prompt';
import { PROJECT_QUESTION_PROMPT } from '../prompts/interview/project.prompt';
import { EVALUATE_ANSWER_PROMPT } from '../prompts/interview/evaluate.prompt';
import { GENERATE_REPORT_PROMPT } from '../prompts/interview/report.prompt';
import { Question, Answer, Evaluation } from '../types/interview.types';

export interface LangGraphInterviewState {
  resumeId: string;
  resumeContent: any;
  targetPosition: string;
  maxQuestions: number;
  questions: Question[];
  answers: Answer[];
  evaluations: Evaluation[];
  currentQuestionIndex: number;
  isFinished: boolean;
  report?: any;
  userId?: string;
  askedQuestionTypes: {
    bagu: number;
    project: number;
  };
  resumeAnalysis?: {
    sections: { key: string; name: string; description: string }[];
    keySkills: string[];
  };
}

class BaGuSubAgent {
  async generateQuestion(
    resumeContent: any,
    targetPosition: string,
    askedQuestions: string[],
    userId?: string
  ): Promise<Question | null> {
    const llm = await createUserLLM(userId, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const chain = RunnableSequence.from([
      BA_GU_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        resumeContent: JSON.stringify(resumeContent, null, 2),
        targetPosition,
        count: '1',
        askedQuestions: askedQuestions.join('\n') || '无',
      });

      const cleaned = this.cleanJson(result);
      const parsed = JSON.parse(cleaned);
      const questions = parsed.questions || [];

      if (questions.length > 0) {
        return {
          id: `q-${Date.now()}-bagu`,
          content: questions[0].content,
          section: 'skills',
          sectionKey: 'skills',
        };
      }
      return null;
    } catch (error) {
      console.error('八股子Agent生成问题失败:', error);
      return null;
    }
  }

  private cleanJson(str: string): string {
    let cleaned = str.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```'))
      cleaned = cleaned.substring(0, cleaned.length - 3);
    return cleaned.trim();
  }
}

class ProjectSubAgent {
  async generateQuestion(
    resumeContent: any,
    targetPosition: string,
    askedQuestions: string[],
    userId?: string
  ): Promise<Question | null> {
    const llm = await createUserLLM(userId, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const chain = RunnableSequence.from([
      PROJECT_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        resumeContent: JSON.stringify(resumeContent, null, 2),
        targetPosition,
        count: '1',
        askedQuestions: askedQuestions.join('\n') || '无',
      });

      const cleaned = this.cleanJson(result);
      const parsed = JSON.parse(cleaned);
      const questions = parsed.questions || [];

      if (questions.length > 0) {
        return {
          id: `q-${Date.now()}-project`,
          content: questions[0].content,
          section: 'projects',
          sectionKey: 'projects',
        };
      }
      return null;
    } catch (error) {
      console.error('项目子Agent生成问题失败:', error);
      return null;
    }
  }

  private cleanJson(str: string): string {
    let cleaned = str.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```'))
      cleaned = cleaned.substring(0, cleaned.length - 3);
    return cleaned.trim();
  }
}

class EvaluationSubAgent {
  async evaluate(
    question: Question,
    answer: string,
    resumeContent: any,
    userId?: string
  ): Promise<Evaluation> {
    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 1000,
    });

    const chain = RunnableSequence.from([
      EVALUATE_ANSWER_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        question: question.content,
        answer,
        resumeSectionContent: JSON.stringify(
          resumeContent[question.sectionKey] || resumeContent,
          null,
          2
        ),
      });

      const cleaned = this.cleanJson(result);
      const parsed = JSON.parse(cleaned);

      return {
        questionId: question.id,
        score: parsed.score,
        feedback: parsed.feedback,
      };
    } catch (error) {
      console.error('评价子Agent评估失败:', error);
      return {
        questionId: question.id,
        score: 5,
        feedback: '需要改进',
      };
    }
  }

  private cleanJson(str: string): string {
    let cleaned = str.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```'))
      cleaned = cleaned.substring(0, cleaned.length - 3);
    return cleaned.trim();
  }
}

class MainAgent {
  private baguAgent: BaGuSubAgent;
  private projectAgent: ProjectSubAgent;
  private evaluationAgent: EvaluationSubAgent;

  constructor() {
    this.baguAgent = new BaGuSubAgent();
    this.projectAgent = new ProjectSubAgent();
    this.evaluationAgent = new EvaluationSubAgent();
  }

  async analyzeResume(
    resumeContent: any,
    userId?: string
  ): Promise<{
    sections: { key: string; name: string; description: string }[];
    keySkills: string[];
  }> {
    const llm = await createUserLLM(userId, {
      temperature: 0.7,
      maxTokens: 2000,
    });

    const chain = RunnableSequence.from([
      ANALYZE_RESUME_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        resumeContent: JSON.stringify(resumeContent, null, 2),
      });

      const cleaned = this.cleanJson(result);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('简历分析失败:', error);
      return { sections: [], keySkills: [] };
    }
  }

  async selectNextQuestionAgent(
    state: LangGraphInterviewState
  ): Promise<'bagu' | 'project'> {
    const projectCount = state.resumeContent?.projects?.length || 0;
    const skillCount = state.resumeContent?.skills?.length || 0;

    const currentBagu = state.askedQuestionTypes.bagu;
    const currentProject = state.askedQuestionTypes.project;

    const hasMoreProjects = currentProject < projectCount;
    const hasMoreSkills = currentBagu < (skillCount || 3);

    if (!hasMoreProjects) return 'bagu';
    if (!hasMoreSkills) return 'project';

    const ratio = currentBagu / Math.max(currentProject, 1);
    if (ratio > 2) return 'project';
    if (ratio < 0.5) return 'bagu';

    return Math.random() > 0.5 ? 'bagu' : 'project';
  }

  async generateNextQuestion(
    state: LangGraphInterviewState
  ): Promise<Question> {
    const askedQuestions = state.questions.map((q) => q.content);
    const selectedAgent = await this.selectNextQuestionAgent(state);

    let question: Question | null = null;

    if (selectedAgent === 'bagu') {
      question = await this.baguAgent.generateQuestion(
        state.resumeContent,
        state.targetPosition,
        askedQuestions,
        state.userId
      );
    } else {
      question = await this.projectAgent.generateQuestion(
        state.resumeContent,
        state.targetPosition,
        askedQuestions,
        state.userId
      );
    }

    if (!question) {
      question = {
        id: `q-${Date.now()}-default`,
        content: '请谈谈你在工作中遇到的最大技术挑战以及你是如何解决的。',
        section: 'general',
        sectionKey: 'general',
      };
    }

    return question;
  }

  async evaluateAnswer(
    question: Question,
    answer: string,
    resumeContent: any,
    userId?: string
  ): Promise<Evaluation> {
    return this.evaluationAgent.evaluate(
      question,
      answer,
      resumeContent,
      userId
    );
  }

  async generateReport(
    resumeContent: any,
    questions: Question[],
    answers: Answer[],
    evaluations: Evaluation[],
    targetPosition: string,
    userId?: string
  ): Promise<any> {
    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 3000,
    });

    const chain = RunnableSequence.from([
      GENERATE_REPORT_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const qaHistory = questions
      .map((q, i) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const evaluation = evaluations.find((e) => e.questionId === q.id);
        if (q.isIntroduction) return '';
        return `问题 ${i + 1}: ${q.content}\n回答: ${answer?.content || '未回答'}\n评分: ${evaluation?.score || 0}\n反馈: ${evaluation?.feedback || ''}`;
      })
      .filter(Boolean)
      .join('\n\n');

    const introQuestion = questions.find((q) => q.isIntroduction);
    const introAnswer = introQuestion
      ? answers.find((a) => a.questionId === introQuestion.id)
      : null;
    let introductionSection =
      introQuestion && introAnswer
        ? `自我介绍内容：\n${introAnswer.content}`
        : '候选人选择跳过自我介绍。';

    try {
      const result = await chain.invoke({
        targetPosition,
        resumeContent: JSON.stringify(resumeContent, null, 2),
        qaHistory,
        introductionSection,
      });

      const cleaned = this.cleanJson(result);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('报告生成失败:', error);
      return {
        overallScore: 60,
        introductionEvaluation: '无法生成自我介绍评估',
        strengths: [],
        weaknesses: [],
        suggestions: [],
      };
    }
  }

  private cleanJson(str: string): string {
    let cleaned = str.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    if (cleaned.endsWith('```'))
      cleaned = cleaned.substring(0, cleaned.length - 3);
    return cleaned.trim();
  }
}

const mainAgent = new MainAgent();

export async function startLangGraphInterview(
  resumeId: string,
  resumeContent: any,
  targetPosition?: string,
  questionCount?: number,
  userId?: string
): Promise<{
  sessionData: LangGraphInterviewState;
  firstQuestion: Question;
}> {
  console.log('=== 使用 LangGraph 架构开始面试 ===');

  const analysis = await mainAgent.analyzeResume(resumeContent, userId);

  const firstQuestion: Question = {
    id: `q-${Date.now()}-intro`,
    content:
      '请简单介绍一下你自己，包括你的教育背景、技术栈和项目经验。（如果不想自我介绍，可以直接说"跳过"）',
    section: 'introduction',
    sectionKey: 'introduction',
    isIntroduction: true,
  };

  const sessionData: LangGraphInterviewState = {
    resumeId,
    resumeContent,
    targetPosition: targetPosition || '通用岗位',
    maxQuestions: questionCount || 5,
    questions: [firstQuestion],
    answers: [],
    evaluations: [],
    currentQuestionIndex: 0,
    isFinished: false,
    userId,
    askedQuestionTypes: { bagu: 0, project: 0 },
    resumeAnalysis: analysis,
  };

  return {
    sessionData,
    firstQuestion,
  };
}

export async function submitLangGraphAnswer(
  state: LangGraphInterviewState,
  answer: string
): Promise<{
  feedback: string;
  nextQuestion: Question | null;
  isFinished: boolean;
  report?: any;
  updatedState: LangGraphInterviewState;
}> {
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const newAnswer: Answer = {
    questionId: currentQuestion.id,
    content: answer,
  };

  const isSkipIntro =
    currentQuestion.isIntroduction &&
    (answer.trim() === '跳过' || answer.trim().toLowerCase() === 'skip');

  let evaluation: Evaluation;
  if (isSkipIntro) {
    evaluation = {
      questionId: currentQuestion.id,
      score: 0,
      feedback: '候选人选择跳过自我介绍',
    };
  } else {
    evaluation = await mainAgent.evaluateAnswer(
      currentQuestion,
      answer,
      state.resumeContent,
      state.userId
    );
  }

  const newEvaluations = [...state.evaluations, evaluation];
  const newAnswers = [...state.answers, newAnswer];

  let newIndex = state.currentQuestionIndex;
  if (!currentQuestion.isIntroduction) {
    newIndex = state.currentQuestionIndex + 1;
  }

  const isFinished = newIndex >= state.maxQuestions;

  let nextQuestion: Question | null = null;
  let report = null;
  let newQuestions = [...state.questions];
  let newQuestionTypes = { ...state.askedQuestionTypes };

  if (isFinished) {
    report = await mainAgent.generateReport(
      state.resumeContent,
      state.questions,
      newAnswers,
      newEvaluations,
      state.targetPosition,
      state.userId
    );
  } else {
    nextQuestion = await mainAgent.generateNextQuestion({
      ...state,
      answers: newAnswers,
      evaluations: newEvaluations,
      currentQuestionIndex: newIndex,
    });

    newQuestions = [...state.questions, nextQuestion];

    const isBagu =
      nextQuestion.sectionKey === 'skills' ||
      nextQuestion.sectionKey === 'general';
    newQuestionTypes = {
      bagu: isBagu
        ? state.askedQuestionTypes.bagu + 1
        : state.askedQuestionTypes.bagu,
      project: !isBagu
        ? state.askedQuestionTypes.project + 1
        : state.askedQuestionTypes.project,
    };
  }

  const updatedState: LangGraphInterviewState = {
    ...state,
    questions: newQuestions,
    answers: newAnswers,
    evaluations: newEvaluations,
    currentQuestionIndex: newIndex,
    isFinished,
    report,
    askedQuestionTypes: newQuestionTypes,
  };

  return {
    feedback: evaluation.feedback,
    nextQuestion,
    isFinished,
    report,
    updatedState,
  };
}
