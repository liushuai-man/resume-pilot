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
    return JSON.parse(session.summary) as LangGraphInterviewState;
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
