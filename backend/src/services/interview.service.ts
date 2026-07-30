import { prisma } from '../database/prisma';
import {
  startLangGraphInterview,
  submitLangGraphAnswer,
} from '../ai/agents/interview.agent';
import {
  InterviewState,
  Question,
  Answer,
  LangGraphInterviewState,
} from '../ai/types/interview.types';

const sessionStore = new Map<
  string,
  LangGraphInterviewState | InterviewState
>();

async function getInterviewSessionState(userId: string, sessionId: string): Promise<LangGraphInterviewState> {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, user_id: userId, session_type: 'interview', is_deleted: false },
    select: { summary: true },
  });
  if (!session) throw new Error('Interview session not found or forbidden');

  const cachedState = sessionStore.get(sessionId) as LangGraphInterviewState;
  if (cachedState) return cachedState;
  if (!session.summary) throw new Error('Interview session is no longer active');

  try {
    const state = JSON.parse(session.summary) as LangGraphInterviewState;
    sessionStore.set(sessionId, state);
    return state;
  } catch {
    throw new Error('Interview session state is invalid');
  }
}

async function saveInterviewSessionState(sessionId: string, state: LangGraphInterviewState): Promise<void> {
  sessionStore.set(sessionId, state);
  await prisma.chatSession.update({ where: { id: sessionId }, data: { summary: JSON.stringify(state) } });
}

// 主流程：面试工作流
export async function startInterview(
  userId: string,
  resumeId: string,
  targetPosition?: string,
  questionCount?: number
): Promise<{
  sessionId: string;
  firstQuestion: Question;
  sessionData: LangGraphInterviewState;
}> {
  console.log('=== 使用 LangGraph 开始面试 ===');

  const resume = await prisma.resume.findUniqueOrThrow({
    where: { id: resumeId, user_id: userId },
  });

  // 创建聊天会话
  const session = await prisma.chatSession.create({
    data: {
      user_id: userId,
      resume_id: resumeId,
      title: `${resume.title} - 面试`,
      session_type: 'interview',
    },
  });

  // 使用 LangGraph 面试 Agent 开始面试
  const { sessionData, firstQuestion } = await startLangGraphInterview(
    resumeId,
    resume.content,
    targetPosition,
    questionCount,
    userId
  );

  // 存储会话状态
  await saveInterviewSessionState(session.id, sessionData);

  return {
    sessionId: session.id,
    firstQuestion,
    sessionData,
  };
}

export async function submitAnswer(
  userId: string,
  sessionId: string,
  question: Question,
  answer: string
): Promise<{
  feedback: string;
  nextQuestion: Question | null;
  isFinished: boolean;
  report?: any;
}> {
  console.log('=== 使用 LangGraph 提交回答 ===');

  // 获取会话状态
  const state = await getInterviewSessionState(userId, sessionId);
  if (!state) {
    throw new Error('会话不存在');
  }

  // 使用 LangGraph 面试 Agent 处理回答
  const result = await submitLangGraphAnswer(state, answer);

  // 更新会话状态
  await saveInterviewSessionState(sessionId, result.updatedState);

  return {
    feedback: result.feedback,
    nextQuestion: result.nextQuestion,
    isFinished: result.isFinished,
    report: result.report,
  };
}

export async function finishInterview(
  userId: string,
  sessionId: string,
  resumeId: string,
  questions: Question[],
  answers: Answer[],
  resumeContent: any,
  report?: any
): Promise<any> {
  console.log('=== 使用 LangGraph 完成面试 ===');

  const state = await getInterviewSessionState(userId, sessionId);
  if (!state) {
    throw new Error('会话不存在');
  }

  let finalReport = report || state.report;

  if (!finalReport) {
    console.log('=== 报告为空，重新生成 ===');
    const { InterviewSupervisorAgent } =
      await import('../ai/agents/interview/supervisor.agent');
    const supervisorAgent = new InterviewSupervisorAgent();
    finalReport = await supervisorAgent.generateReport(
      state.resumeContent,
      questions.length > 0 ? questions : state.questions,
      answers.length > 0 ? answers : state.answers,
      state.evaluations,
      state.targetPosition,
      state.profile,
      userId
    );
  }

  let finalScore = finalReport?.overallScore;

  if (finalScore === undefined || finalScore === null) {
    const validEvaluations = state.evaluations.filter(
      (e) => e.score !== undefined && e.score !== null
    );
    if (validEvaluations.length > 0) {
      const totalScore = validEvaluations.reduce((sum, e) => sum + e.score, 0);
      finalScore = Math.round((totalScore / validEvaluations.length) * 10);
    } else {
      const answeredCount =
        answers.length > 0 ? answers.length : state.answers.length;
      const totalQuestions =
        questions.length > 0 ? questions.length : state.questions.length;
      if (answeredCount === 0) {
        finalScore = 0;
      } else if (answeredCount === totalQuestions) {
        finalScore = 50;
      } else {
        finalScore = Math.round((answeredCount / totalQuestions) * 40);
      }
    }
  }

  if (finalReport && !finalReport.overallScore) {
    finalReport.overallScore = finalScore;
  }

  const interviewResult = await prisma.interviewResult.create({
    data: {
      user_id: userId,
      session_id: sessionId,
      resume_id: resumeId,
      position: state.targetPosition,
      score: finalScore,
      report: finalReport as any,
    },
  });

  sessionStore.delete(sessionId);
  await prisma.chatSession.update({ where: { id: sessionId }, data: { summary: null } });

  return interviewResult;
}

export async function getInterviewResults(userId: string) {
  return await prisma.interviewResult.findMany({
    where: { user_id: userId, is_deleted: false },
    include: { resume: true },
    orderBy: { created_at: 'desc' },
  });
}

export async function getInterviewResult(resultId: string, userId: string) {
  return await prisma.interviewResult.findFirst({
    where: { id: resultId, user_id: userId, is_deleted: false },
    include: { resume: true },
  });
}

export async function deleteInterviewResult(resultId: string, userId: string) {
  return await prisma.interviewResult.update({
    where: { id: resultId, user_id: userId, is_deleted: false },
    data: { is_deleted: true },
  });
}
