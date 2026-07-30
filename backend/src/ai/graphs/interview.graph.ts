import { END, START, StateGraph } from '@langchain/langgraph';
import { InterviewSupervisorAgent } from '../agents/interview/supervisor.agent';
import { getResumeText } from '../agents/interview/utils';
import {
  Answer,
  CandidateProfile,
  Evaluation,
  LangGraphInterviewState,
  Question,
} from '../types/interview.types';

type InterviewOperation = 'submit_answer' | 'next_question' | 'generate_report';

interface InterviewWorkflowState {
  session: LangGraphInterviewState;
  operation: InterviewOperation;
  answer: string;
  evaluation: Evaluation | null;
  updatedProfile: CandidateProfile | null;
  feedback: string;
  nextQuestion: Question | null;
  report: any;
}

const supervisor = new InterviewSupervisorAgent();

export function createInitialInterviewState(
  resumeId: string,
  resumeContent: any,
  targetPosition?: string,
  questionCount = 5,
  userId?: string
): { session: LangGraphInterviewState; firstQuestion: Question } {
  const firstQuestion: Question = {
    id: `q-${Date.now()}-intro`,
    content: '请简单介绍一下你自己，包括教育背景、技术栈和项目经历。如果不想自我介绍，可以直接输入“跳过”。',
    section: 'introduction',
    sectionKey: 'introduction',
    type: 'introduction',
    isIntroduction: true,
  };

  return {
    firstQuestion,
    session: {
      resumeId,
      resumeContent,
      resumeText: getResumeText(resumeContent),
      targetPosition: targetPosition || '通用岗位',
      maxQuestions: questionCount,
      questions: [firstQuestion],
      answers: [],
      evaluations: [],
      currentQuestionIndex: 0,
      isFinished: false,
      userId,
      interviewPlan: [],
      strategy: null,
      profile: { skills: {}, overallLevel: 0 },
      askedQuestionTypes: { technical: 0, project: 0, followup: 0 },
      memoryResult: null,
      resumeAnalysis: { sections: [], keySkills: [] },
    },
  };
}

const workflow = new StateGraph<InterviewWorkflowState>({
  channels: {
    session: null,
    operation: null,
    answer: null,
    evaluation: null,
    updatedProfile: null,
    feedback: null,
    nextQuestion: null,
    report: null,
  },
});

workflow.addNode('evaluate_answer', async (state) => {
  const question = state.session.questions[state.session.currentQuestionIndex];
  if (!question) throw new Error('Current interview question does not exist');

  const skipped =
    question.isIntroduction &&
    ['跳过', 'skip'].includes(state.answer.trim().toLowerCase());
  if (skipped) {
    const evaluation: Evaluation = {
      questionId: question.id,
      score: 0,
      feedback: '候选人选择跳过自我介绍',
      strengths: [],
      weaknesses: [],
    };
    return {
      evaluation,
      updatedProfile: state.session.profile,
      feedback: evaluation.feedback,
    };
  }

  const result = await supervisor.evaluateAnswer(
    question,
    state.answer,
    state.session.resumeText,
    state.session.targetPosition,
    state.session.profile,
    state.session.userId
  );
  return {
    evaluation: result.evaluation,
    updatedProfile: result.updatedProfile,
    feedback: result.evaluation.feedback,
  };
});

workflow.addNode('advance_state', async (state) => {
  if (!state.evaluation || !state.updatedProfile) {
    throw new Error('Interview evaluation is missing');
  }
  const question = state.session.questions[state.session.currentQuestionIndex];
  const answer: Answer = { questionId: question.id, content: state.answer };
  const currentQuestionIndex = state.session.currentQuestionIndex + 1;
  return {
    session: {
      ...state.session,
      answers: [...state.session.answers, answer],
      evaluations: [...state.session.evaluations, state.evaluation],
      currentQuestionIndex,
      isFinished: currentQuestionIndex >= state.session.maxQuestions,
      profile: state.updatedProfile,
    },
  };
});

workflow.addNode('generate_report', async (state) => {
  const report = await supervisor.generateReport(
    state.session.resumeText,
    state.session.questions,
    state.session.answers,
    state.session.evaluations,
    state.session.targetPosition,
    state.session.profile,
    state.session.userId
  );
  return { report, session: { ...state.session, report } };
});

workflow.addNode('complete_answer', async (state) => ({
  session: { ...state.session, isFinished: true },
}));

workflow.addNode('generate_question', async (state) => ({
  nextQuestion: await supervisor.generateNextQuestion(state.session),
}));

workflow.addNode('append_question', async (state) => {
  if (!state.nextQuestion) {
    throw new Error('Generated interview question is missing');
  }
  const type = state.nextQuestion.type || 'technical';
  return {
    session: {
      ...state.session,
      questions: [...state.session.questions, state.nextQuestion],
      askedQuestionTypes: {
        technical: state.session.askedQuestionTypes.technical + (type === 'technical' ? 1 : 0),
        project: state.session.askedQuestionTypes.project + (type === 'project' ? 1 : 0),
        followup: state.session.askedQuestionTypes.followup + (type === 'followup' ? 1 : 0),
      },
    },
  };
});

// LangGraph 0.0.x mutates the builder but does not preserve added node names
// when addNode() calls are not chained, so this cast is kept at the wiring boundary.
const graphBuilder = workflow as any;

graphBuilder.addConditionalEdges(
  START,
  (state: InterviewWorkflowState) => state.operation,
  {
    submit_answer: 'evaluate_answer',
    next_question: 'generate_question',
    generate_report: 'generate_report',
  }
);
graphBuilder.addEdge('evaluate_answer', 'advance_state');
graphBuilder.addConditionalEdges(
  'advance_state',
  (state: InterviewWorkflowState) =>
    state.session.isFinished ? 'finished' : 'continue',
  { finished: 'complete_answer', continue: END }
);
graphBuilder.addEdge('complete_answer', END);
graphBuilder.addEdge('generate_report', END);
graphBuilder.addEdge('generate_question', 'append_question');
graphBuilder.addEdge('append_question', END);

const interviewGraph = graphBuilder.compile();

function initialGraphState(
  session: LangGraphInterviewState,
  operation: InterviewOperation,
  answer = ''
): InterviewWorkflowState {
  return {
    session,
    operation,
    answer,
    evaluation: null,
    updatedProfile: null,
    feedback: '',
    nextQuestion: null,
    report: null,
  };
}

export async function runAnswerGraph(session: LangGraphInterviewState, answer: string) {
  return await interviewGraph.invoke(initialGraphState(session, 'submit_answer', answer));
}

export async function runNextQuestionGraph(session: LangGraphInterviewState) {
  return await interviewGraph.invoke(initialGraphState(session, 'next_question'));
}

export async function runReportGraph(session: LangGraphInterviewState) {
  return await interviewGraph.invoke(initialGraphState(session, 'generate_report'));
}

export { interviewGraph };
