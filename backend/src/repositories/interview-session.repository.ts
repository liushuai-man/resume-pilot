import { prisma } from '../database/prisma';
import { LangGraphInterviewState } from '../ai/types/interview.types';

export async function loadInterviewState(
  userId: string,
  sessionId: string
): Promise<LangGraphInterviewState> {
  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      user_id: userId,
      session_type: 'interview',
      is_deleted: false,
    },
    select: { summary: true },
  });

  if (!session) throw new Error('Interview session not found or forbidden');
  if (!session.summary) throw new Error('Interview session is no longer active');

  try {
    const state = JSON.parse(session.summary) as LangGraphInterviewState;
    // 兼容升级前已经开始、尚未结束的面试会话。
    state.resumeSnapshot ||= {
      title: '简历',
      content: state.resumeContent,
      updatedAt: new Date(0).toISOString(),
    };
    state.jobProfileSnapshot ??= null;
    state.coveredDimensions ||= {};
    state.questions = state.questions.map((question) => ({
      ...question,
      dimensionKeys: question.dimensionKeys || (question.isIntroduction ? ['communication'] : ['technical']),
    }));
    state.rubricSnapshot ||= {
      version: 'interview-rubric-v1',
      mode: 'general',
      dimensions: [
        { key: 'technical', label: '技术能力', weight: 0.4 },
        { key: 'communication', label: '表达能力', weight: 0.3 },
        { key: 'project', label: '项目深度', weight: 0.3 },
      ],
    };
    return state;
  } catch {
    throw new Error('Interview session state is invalid');
  }
}

export async function saveInterviewState(
  sessionId: string,
  state: LangGraphInterviewState
): Promise<void> {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { summary: JSON.stringify(state) },
  });
}

export async function clearInterviewState(sessionId: string): Promise<void> {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { summary: null },
  });
}
