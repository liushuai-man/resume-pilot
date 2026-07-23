import { prisma } from '../database/prisma';
import { interviewAgent } from '../ai/agents/interview.agent';
import {
  startLangGraphInterview,
  submitLangGraphAnswer,
  LangGraphInterviewState,
} from '../ai/agents/langgraph.interview.agent';
import { InterviewState, Question, Answer } from '../ai/types/interview.types';

const sessionStore = new Map<
  string,
  LangGraphInterviewState | InterviewState
>();

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
  sessionStore.set(session.id, sessionData);

  return {
    sessionId: session.id,
    firstQuestion,
    sessionData,
  };
}

export async function submitAnswer(
  sessionId: string,
  question: Question,
  answer: string,
  resumeContent: any
): Promise<{
  feedback: string;
  nextQuestion: Question | null;
  isFinished: boolean;
  report?: any;
}> {
  console.log('=== 使用 LangGraph 提交回答 ===');

  // 获取会话状态
  const state = sessionStore.get(sessionId) as LangGraphInterviewState;
  if (!state) {
    throw new Error('会话不存在');
  }

  // 使用 LangGraph 面试 Agent 处理回答
  const result = await submitLangGraphAnswer(state, answer);

  // 更新会话状态
  sessionStore.set(sessionId, result.updatedState);

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
  resumeContent: any
): Promise<any> {
  console.log('=== 使用 LangGraph 完成面试 ===');

  const state = sessionStore.get(sessionId) as LangGraphInterviewState;
  if (!state) {
    throw new Error('会话不存在');
  }

  // 保存面试结果
  const interviewResult = await prisma.interviewResult.create({
    data: {
      user_id: userId,
      session_id: sessionId,
      resume_id: resumeId,
      position: state.targetPosition,
      score: state.report?.overallScore || 60,
      report: state.report as any,
    },
  });

  // 清理会话存储
  sessionStore.delete(sessionId);

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
