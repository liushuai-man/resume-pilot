import { prisma } from '../database/prisma';
import {
  createInitialInterviewState,
  runAnswerGraph,
  runNextQuestionGraph,
  runReportGraph,
} from '../ai/graphs/interview.graph';
import { Question } from '../ai/types/interview.types';
import {
  clearInterviewState,
  loadInterviewState,
  saveInterviewState,
} from '../repositories/interview-session.repository';

export async function startInterview(
  userId: string,
  resumeId: string,
  targetPosition?: string,
  questionCount?: number
): Promise<{ sessionId: string; firstQuestion: Question }> {
  const resume = await prisma.resume.findFirstOrThrow({
    where: { id: resumeId, user_id: userId, is_deleted: false },
  });
  const chatSession = await prisma.chatSession.create({
    data: {
      user_id: userId,
      resume_id: resumeId,
      title: `${resume.title} - 面试`,
      session_type: 'interview',
    },
  });
  const { session, firstQuestion } = createInitialInterviewState(
    resumeId,
    resume.content,
    targetPosition,
    questionCount,
    userId
  );
  await saveInterviewState(chatSession.id, session);
  return { sessionId: chatSession.id, firstQuestion };
}

export async function submitAnswer(
  userId: string,
  sessionId: string,
  answer: string
) {
  const state = await loadInterviewState(userId, sessionId);
  const result = await runAnswerGraph(state, answer);
  await saveInterviewState(sessionId, result.session);
  return {
    feedback: result.feedback,
    isFinished: result.session.isFinished,
  };
}

export async function generateInterviewNextQuestion(
  userId: string,
  sessionId: string
) {
  const state = await loadInterviewState(userId, sessionId);
  if (state.isFinished) return null;
  const result = await runNextQuestionGraph(state);
  await saveInterviewState(sessionId, result.session);
  return result.nextQuestion;
}

export async function finishInterview(userId: string, sessionId: string) {
  const state = await loadInterviewState(userId, sessionId);
  const graphResult = state.report
    ? { report: state.report }
    : await runReportGraph(state);
  const report = graphResult.report;
  const scoredEvaluations = state.evaluations.filter((item) => item.score > 0);
  const fallbackScore = scoredEvaluations.length
    ? Math.round(
        (scoredEvaluations.reduce((sum, item) => sum + item.score, 0) /
          scoredEvaluations.length) *
          10
      )
    : 0;
  const score = report?.overallScore ?? fallbackScore;

  if (report && report.overallScore == null) report.overallScore = score;

  const result = await prisma.interviewResult.create({
    data: {
      user_id: userId,
      session_id: sessionId,
      resume_id: state.resumeId,
      position: state.targetPosition,
      score,
      report,
    },
  });
  await clearInterviewState(sessionId);
  return result;
}

export async function getInterviewResults(userId: string) {
  return prisma.interviewResult.findMany({
    where: { user_id: userId, is_deleted: false },
    include: { resume: true },
    orderBy: { created_at: 'desc' },
  });
}

export async function getInterviewResult(resultId: string, userId: string) {
  return prisma.interviewResult.findFirst({
    where: { id: resultId, user_id: userId, is_deleted: false },
    include: { resume: true },
  });
}

export async function deleteInterviewResult(resultId: string, userId: string) {
  const result = await prisma.interviewResult.updateMany({
    where: { id: resultId, user_id: userId, is_deleted: false },
    data: { is_deleted: true },
  });
  return result.count > 0;
}
