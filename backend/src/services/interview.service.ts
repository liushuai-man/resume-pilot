import { prisma } from '../database/prisma';
import {
  createInitialInterviewState,
  runAnswerGraph,
  runNextQuestionGraph,
  runReportGraph,
} from '../ai/graphs/interview.graph';
import { Question } from '../ai/types/interview.types';
import type { Evaluation } from '../ai/types/interview.types';
import {
  clearInterviewState,
  loadInterviewState,
  saveInterviewState,
} from '../repositories/interview-session.repository';
import { getDefaultModelConfig } from './model-config.service';

export async function startInterview(
  userId: string,
  resumeId: string,
  targetPosition?: string,
  questionCount?: number,
  jobProfileId?: string
): Promise<{ sessionId: string; firstQuestion: Question; context: any }> {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, user_id: userId, is_deleted: false },
  });
  if (!resume) {
    throw new Error('RESUME_NOT_FOUND');
  }
  const jobProfile = jobProfileId
    ? await prisma.jobProfile.findFirst({
        where: { id: jobProfileId, user_id: userId, status: 'confirmed' },
      })
    : null;
  if (jobProfileId && !jobProfile) throw new Error('JOB_PROFILE_NOT_CONFIRMED');
  const position = jobProfile?.job_title || targetPosition || '通用岗位';
  const rubricSnapshot = {
    version: 'interview-rubric-v1',
    mode: jobProfile ? 'job_profile' as const : 'general' as const,
    dimensions: [
      { key: 'technical', label: '技术能力', weight: jobProfile ? 0.45 : 0.4 },
      { key: 'communication', label: '表达能力', weight: 0.3 },
      { key: 'project', label: '项目深度', weight: jobProfile ? 0.25 : 0.3 },
    ],
  };
  const jobProfileSnapshot = jobProfile ? {
    id: jobProfile.id, version: jobProfile.version, jobTitle: jobProfile.job_title,
    seniority: jobProfile.seniority, industry: jobProfile.industry,
    responsibilities: jobProfile.responsibilities as any[],
    requiredSkills: jobProfile.required_skills as any[],
    preferredSkills: jobProfile.preferred_skills as any[],
    keywords: jobProfile.keywords as string[], promptVersion: jobProfile.prompt_version,
    parserVersion: jobProfile.parser_version,
  } : null;
  const modelConfig = await getDefaultModelConfig(userId);
  if (!modelConfig) {
    throw new Error('MODEL_CONFIG_REQUIRED');
  }
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
    position,
    questionCount,
    userId,
    { resumeSnapshot: { title: resume.title, content: resume.content, updatedAt: resume.updated_at.toISOString() }, jobProfileSnapshot, rubricSnapshot }
  );
  await saveInterviewState(chatSession.id, session);
  return { sessionId: chatSession.id, firstQuestion, context: { position, resumeTitle: resume.title, jobProfile: jobProfileSnapshot && { id: jobProfileSnapshot.id, version: jobProfileSnapshot.version, jobTitle: jobProfileSnapshot.jobTitle }, rubric: rubricSnapshot } };
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
  const evaluatedState = 'session' in graphResult ? graphResult.session : state;
  const report = { ...graphResult.report, interviewContext: {
    resume: { title: state.resumeSnapshot.title, updatedAt: state.resumeSnapshot.updatedAt },
    jobProfile: state.jobProfileSnapshot,
    rubric: state.rubricSnapshot,
  }, questionEvaluations: evaluatedState.evaluations };
  const scoredEvaluations: Evaluation[] = evaluatedState.evaluations.filter((item: Evaluation) => item.score > 0);
  const fallbackScore = scoredEvaluations.length
    ? Math.round(
        (scoredEvaluations.reduce((sum: number, item: Evaluation) => sum + item.score, 0) /
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
