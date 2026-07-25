import { InterviewSupervisorAgent } from './interview/supervisor.agent';
import {
  Question,
  Answer,
  LangGraphInterviewState,
} from '../types/interview.types';
import { getResumeText } from './interview/utils';

const supervisorAgent = new InterviewSupervisorAgent();

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
  console.log('=== 使用 LangGraph 多 Agent 架构开始面试 ===');

  const position = targetPosition || '通用岗位';

  const firstQuestion: Question = {
    id: `q-${Date.now()}-intro`,
    content:
      '请简单介绍一下你自己，包括你的教育背景、技术栈和项目经验。（如果不想自我介绍，可以直接说"跳过"）',
    section: 'introduction',
    sectionKey: 'introduction',
    type: 'introduction',
  };

  const resumeText = getResumeText(resumeContent);
  
  const sessionData: LangGraphInterviewState = {
    resumeId,
    resumeContent,
    resumeText,
    targetPosition: position,
    maxQuestions: questionCount || 5,
    questions: [firstQuestion],
    answers: [],
    evaluations: [],
    currentQuestionIndex: 0,
    isFinished: false,
    userId,
    interviewPlan: [],
    strategy: null,
    profile: {
      skills: {},
      overallLevel: 0,
    },
    askedQuestionTypes: { technical: 0, project: 0, followup: 0 },
    memoryResult: null,
    resumeAnalysis: { sections: [], keySkills: [] },
  };

  setTimeout(async () => {
    try {
      const [plan, analysis] = await Promise.all([
        supervisorAgent.generateInterviewPlan(resumeContent, position, userId),
        supervisorAgent.analyzeResume(resumeContent, userId),
      ]);
      sessionData.interviewPlan = plan;
      sessionData.resumeAnalysis = analysis;
      console.log('=== 面试计划已生成 ===', plan);
    } catch (error) {
      console.error('后台面试计划生成失败:', error);
    }
  }, 100);

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

  let evaluation;
  let updatedProfile = state.profile;

  if (isSkipIntro) {
    evaluation = {
      questionId: currentQuestion.id,
      score: 0,
      feedback: '候选人选择跳过自我介绍',
    };
  } else {
    const result = await supervisorAgent.evaluateAnswer(
      currentQuestion,
      answer,
      state.resumeText,
      state.targetPosition,
      state.profile,
      state.userId
    );
    evaluation = result.evaluation;
    updatedProfile = result.updatedProfile;
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
    report = await supervisorAgent.generateReport(
      state.resumeText,
      state.questions,
      newAnswers,
      newEvaluations,
      state.targetPosition,
      updatedProfile,
      state.userId
    );
  } else {
    const stateForNextQuestion: LangGraphInterviewState = {
      ...state,
      answers: newAnswers,
      evaluations: newEvaluations,
      currentQuestionIndex: newIndex,
      profile: updatedProfile,
    };

    nextQuestion =
      await supervisorAgent.generateNextQuestion(stateForNextQuestion);

    newQuestions = [...state.questions, nextQuestion];

    const qType = nextQuestion.type || 'technical';
    newQuestionTypes = {
      technical:
        qType === 'technical'
          ? state.askedQuestionTypes.technical + 1
          : state.askedQuestionTypes.technical,
      project:
        qType === 'project'
          ? state.askedQuestionTypes.project + 1
          : state.askedQuestionTypes.project,
      followup:
        qType === 'followup'
          ? state.askedQuestionTypes.followup + 1
          : state.askedQuestionTypes.followup,
    };

    if (nextQuestion.topic) {
      state.interviewPlan = state.interviewPlan.map((p) =>
        p.topic === nextQuestion!.topic
          ? { ...p, askedCount: p.askedCount + 1 }
          : p
      );
    }
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
    profile: updatedProfile,
  };

  return {
    feedback: evaluation.feedback,
    nextQuestion,
    isFinished,
    report,
    updatedState,
  };
}
