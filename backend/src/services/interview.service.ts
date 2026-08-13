import { prisma } from '../database/prisma';
import {
  createInitialInterviewState,
  runAnswerGraph,
  runNextQuestionGraph,
  runReportGraph,
} from '../ai/graphs/interview.graph';
import { Question } from '../ai/types/interview.types';
import type { Evaluation } from '../ai/types/interview.types';
import type { InterviewPlanItem } from '../ai/types/interview.types';
import {
  clearInterviewState,
  loadInterviewState,
  saveInterviewState,
} from '../repositories/interview-session.repository';
import { getDefaultModelConfig } from './model-config.service';
import { createHash } from 'node:crypto';
import type { LangGraphInterviewState } from '../ai/types/interview.types';

function evaluationInputHash(state: LangGraphInterviewState): string {
  return createHash('sha256').update(JSON.stringify({
    resume: state.resumeSnapshot,
    jobProfile: state.jobProfileSnapshot,
    rubric: state.rubricSnapshot,
    questions: state.questions,
    answers: state.answers,
  })).digest('hex');
}

export async function startInterview(
  userId: string,
  resumeId: string,
  targetPosition?: string,
  questionCount?: number,
  jobProfileId?: string,
  practiceTopic?: string
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
  const planTopics = jobProfile
    ? [
        ...((jobProfile.required_skills as any[]) || []).map((item) => item.name),
        ...((jobProfile.responsibilities as any[]) || []).map((item) => item.name),
      ].filter(Boolean)
    : [];
  if (practiceTopic?.trim()) planTopics.unshift(practiceTopic.trim());
  // 计划题数包含固定的自我介绍题；communication 的 askedCount=1 与之对应。
  const questionSlots = questionCount || 5;
  const interviewPlan: InterviewPlanItem[] = rubricSnapshot.dimensions.map((dimension, index) => ({
    dimensionKey: dimension.key,
    dimensionLabel: dimension.label,
    topic: planTopics[index] || (dimension.key === 'project' ? '项目经历与技术取舍' : dimension.label),
    priority: Math.round(dimension.weight * 10),
    count: index < questionSlots ? Math.max(1, Math.round(questionSlots * dimension.weight)) : 0,
    askedCount: dimension.key === 'communication' ? 1 : 0,
  }));
  let assigned = interviewPlan.reduce((sum, item) => sum + item.count, 0);
  while (assigned > questionSlots) {
    const item = [...interviewPlan].reverse().find((candidate) => candidate.count > 0);
    if (!item) break;
    item.count -= 1; assigned -= 1;
  }
  while (assigned < questionSlots) {
    interviewPlan[assigned % interviewPlan.length].count += 1; assigned += 1;
  }
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
    { resumeSnapshot: { title: resume.title, content: resume.content, updatedAt: resume.updated_at.toISOString() }, jobProfileSnapshot, rubricSnapshot, interviewPlan }
  );
  await saveInterviewState(chatSession.id, session);
  return { sessionId: chatSession.id, firstQuestion, context: { position, resumeTitle: resume.title, jobProfile: jobProfileSnapshot && { id: jobProfileSnapshot.id, version: jobProfileSnapshot.version, jobTitle: jobProfileSnapshot.jobTitle }, rubric: rubricSnapshot, interviewPlan, practiceTopic: practiceTopic?.trim() || null } };
}

export async function submitAnswer(
  userId: string,
  sessionId: string,
  answer: string,
  submissionId: string
) {
  const state = await loadInterviewState(userId, sessionId);
  const existing = state.answers.find((item) => item.submissionId === submissionId);
  if (existing) return { isFinished: state.isFinished, questionId: existing.questionId, duplicate: true };
  const currentQuestion = state.questions[state.currentQuestionIndex];
  if (!currentQuestion) throw new Error('INTERVIEW_QUESTION_UNAVAILABLE');
  const result = await runAnswerGraph(state, answer, submissionId);
  await saveInterviewState(sessionId, result.session);
  return {
    isFinished: result.session.isFinished,
    questionId: currentQuestion.id,
    duplicate: false,
  };
}

export async function generateInterviewNextQuestion(
  userId: string,
  sessionId: string
) {
  const state = await loadInterviewState(userId, sessionId);
  if (state.isFinished) return null;
  // 上次已生成并保存、但响应在网络中丢失时，直接返回同一题，避免重复调用模型。
  const existingQuestion = state.questions[state.currentQuestionIndex];
  if (existingQuestion) return existingQuestion;
  const result = await runNextQuestionGraph(state);
  await saveInterviewState(sessionId, result.session);
  return result.nextQuestion;
}

export async function finishInterview(userId: string, sessionId: string) {
  const reportStartedAt = Date.now();
  const state = await loadInterviewState(userId, sessionId);
  const inputHash = evaluationInputHash(state);
  let pending = await prisma.interviewResult.findFirst({
    where: { user_id: userId, session_id: sessionId, is_deleted: false },
  });
  if (pending?.status === 'completed') return pending;
  pending = pending
    ? await prisma.interviewResult.update({
      where: { id: pending.id },
        data: { status: 'generating', error_message: null, failed_node: null,
          current_node: 'transcript_validation', evaluation_input_hash: inputHash },
      })
    : await prisma.interviewResult.create({
        data: {
          user_id: userId, session_id: sessionId, resume_id: state.resumeId,
          position: state.targetPosition, score: 0, report: {}, status: 'generating',
          current_node: 'transcript_validation', pipeline_state: {}, evaluation_input_hash: inputHash,
        },
      });

  let currentNode = 'transcript_validation';
  const storedPipeline = pending.pipeline_state && typeof pending.pipeline_state === 'object' && !Array.isArray(pending.pipeline_state)
    ? pending.pipeline_state as Record<string, string> : {};
  const checkpointValid = pending.evaluation_input_hash === inputHash && Array.isArray(pending.evaluation_checkpoint);
  const evaluationModel = await getDefaultModelConfig(userId);
  const pipelineState: Record<string, string> = checkpointValid ? { ...storedPipeline } : {};
  try {
  if (!state.questions.length || state.answers.some((answer) => !state.questions.some((question) => question.id === answer.questionId))) {
    throw new Error('INTERVIEW_TRANSCRIPT_INVALID');
  }
  pipelineState.transcript_validation = 'succeeded';
  currentNode = 'batch_evaluation';
  await prisma.interviewResult.update({ where: { id: pending.id }, data: { current_node: currentNode, pipeline_state: pipelineState } });
  const checkpointState: LangGraphInterviewState = checkpointValid
    ? { ...state, evaluations: pending.evaluation_checkpoint as unknown as Evaluation[], report: undefined }
    : state;
  const graphResult = await runReportGraph(checkpointState);
  const evaluatedState = graphResult.session;
  // 评价成功后先保存 checkpoint；后续汇总或发布失败时无需再次调用模型。
  await saveInterviewState(sessionId, evaluatedState);
  await prisma.interviewResult.update({ where: { id: pending.id }, data: {
    evaluation_input_hash: inputHash,
    evaluation_checkpoint: evaluatedState.evaluations as any,
    pipeline_state: { ...pipelineState, batch_evaluation: 'succeeded' },
    current_node: 'report_composition',
  } });
  pipelineState.batch_evaluation = 'succeeded';
  pipelineState.report_composition = 'succeeded';
  const report = { ...graphResult.report, interviewContext: {
    resume: { title: state.resumeSnapshot.title, updatedAt: state.resumeSnapshot.updatedAt },
    jobProfile: state.jobProfileSnapshot,
    rubric: state.rubricSnapshot,
  }, questionEvaluations: evaluatedState.evaluations, evaluationAudit: {
    modelVersion: evaluationModel?.model_name || 'unknown', promptVersion: 'interview-batch-evaluation-v1',
    rubricVersion: state.rubricSnapshot.version, modelCallCount: checkpointValid ? 0 : 1,
    reusedCheckpoint: checkpointValid, durationMs: Date.now() - reportStartedAt,
  } };
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

  const result = await prisma.interviewResult.update({
    where: { id: pending.id },
    data: { score, report, status: 'completed', error_message: null, failed_node: null,
      current_node: 'report_published', pipeline_state: { ...pipelineState, report_publication: 'succeeded' }, completed_at: new Date() },
  });
  await clearInterviewState(sessionId);
  return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : '报告生成失败';
    return prisma.interviewResult.update({
      where: { id: pending.id },
      data: { status: 'failed', error_message: message.slice(0, 500), failed_node: currentNode,
        current_node: currentNode, pipeline_state: { ...pipelineState, [currentNode]: 'failed' } },
    });
  }
}

export async function getActiveInterviewSession(userId: string, sessionId: string) {
  const state = await loadInterviewState(userId, sessionId);
  const currentQuestion = state.questions[state.currentQuestionIndex] || null;
  return {
    sessionId,
    resumeId: state.resumeId,
    targetPosition: state.targetPosition,
    maxQuestions: state.maxQuestions,
    questions: state.questions,
    answers: state.answers,
    currentQuestion,
    isFinished: state.isFinished,
    nextQuestionPending: !state.isFinished && state.currentQuestionIndex >= state.questions.length,
    context: {
      resumeTitle: state.resumeSnapshot.title,
      jobProfile: state.jobProfileSnapshot && {
        id: state.jobProfileSnapshot.id,
        version: state.jobProfileSnapshot.version,
        jobTitle: state.jobProfileSnapshot.jobTitle,
      },
      rubric: state.rubricSnapshot,
    },
  };
}

export async function retryInterviewReport(userId: string, resultId: string) {
  const result = await prisma.interviewResult.findFirst({
    where: { id: resultId, user_id: userId, is_deleted: false },
  });
  if (!result) throw new Error('INTERVIEW_RESULT_NOT_FOUND');
  if (result.status === 'completed') return result;
  if (result.status === 'generating') return result;
  if (!result.session_id) throw new Error('INTERVIEW_SESSION_UNAVAILABLE');
  return finishInterview(userId, result.session_id);
}

const retryableReportNodes = new Set(['transcript_validation', 'batch_evaluation', 'report_composition', 'report_publication']);

export async function retryInterviewNode(
  userId: string, resultId: string, nodeKey: string, expectedInputHash: string
) {
  if (!retryableReportNodes.has(nodeKey)) throw new Error('INTERVIEW_NODE_NOT_RETRYABLE');
  const result = await prisma.interviewResult.findFirst({
    where: { id: resultId, user_id: userId, is_deleted: false },
  });
  if (!result) throw new Error('INTERVIEW_RESULT_NOT_FOUND');
  if (!result.session_id) throw new Error('INTERVIEW_SESSION_UNAVAILABLE');
  if (result.status === 'generating') throw new Error('INTERVIEW_NODE_ALREADY_RUNNING');
  if (result.status !== 'failed' || result.failed_node !== nodeKey) throw new Error('INTERVIEW_NODE_STATE_CONFLICT');
  const state = await loadInterviewState(userId, result.session_id);
  const currentHash = evaluationInputHash(state);
  if (!expectedInputHash || expectedInputHash !== currentHash || result.evaluation_input_hash !== currentHash) {
    throw new Error('INTERVIEW_CHECKPOINT_STALE');
  }
  const claimed = await prisma.interviewResult.updateMany({
    where: { id: result.id, user_id: userId, status: 'failed', failed_node: nodeKey, evaluation_input_hash: expectedInputHash },
    data: { status: 'generating', current_node: nodeKey, error_message: null },
  });
  if (claimed.count !== 1) throw new Error('INTERVIEW_NODE_ALREADY_RUNNING');
  return finishInterview(userId, result.session_id);
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
