import type { Response } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { badRequest, created, error, notFound, success } from '../utils/response';
import {
  JOB_PROFILE_PARSER_VERSION,
  JOB_PROFILE_PROMPT_VERSION,
  assertProfileEvidence,
  parseJobDescription,
} from '../services/job-profile.service';
import { analyzeResumeForAts } from '../services/ats-analysis.service';
import { buildMatchRequirements, evaluateJobMatch } from '../services/job-match.service';
import { generateJobMatchOptimization } from '../services/job-match-optimization.service';
import { applyContentQualitySuggestion } from '../services/resume-version.service';
import type { ContentQualityIssue } from '../types/content-quality.types';
import { optimizationActionData } from '../services/optimization-action.service';
import { createSuggestionToken } from '../services/suggestion-token.service';

const createJobSchema = z.object({
  title: z.string().trim().max(120).optional(),
  company: z.string().trim().max(120).optional(),
  rawText: z.string().trim().min(30, 'JD 内容过短').max(50_000, 'JD 内容过长'),
  sourceUrl: z.string().url().max(2_000).optional().or(z.literal('')),
});

const requirementSchema = z.object({
  name: z.string().trim().min(1).max(300),
  evidence: z.string().trim().min(1).max(1_000),
  confidence: z.number().min(0).max(1),
});

const updateProfileSchema = z.object({
  jobTitle: z.string().trim().min(1).max(120),
  seniority: z.string().trim().max(120).optional().nullable(),
  industry: z.string().trim().max(120).optional().nullable(),
  responsibilities: z.array(requirementSchema).max(50),
  requiredSkills: z.array(requirementSchema).max(50),
  preferredSkills: z.array(requirementSchema).max(50),
  keywords: z.array(z.string().trim().min(1).max(100)).max(20),
});

const atsAnalysisSchema = z.object({
  resumeId: z.string().uuid('简历 ID 无效'),
});
const matchOptimizationSchema = z.object({ analysisId: z.string().uuid(), requirementIndex: z.number().int().min(0), userFacts: z.string().trim().max(4000).optional().default('') });
const applyMatchOptimizationSchema = z.object({ analysisId: z.string().uuid(), requirementIndex: z.number().int().min(0), suggestedText: z.string().trim().min(1).max(4000) });

const matchRequirementIssue = (requirement: any): ContentQualityIssue => ({
  fieldId: requirement.resumeFieldId,
  section: requirement.section,
  itemId: requirement.itemId,
  field: requirement.field,
  evidence: requirement.resumeEvidence,
  dimension: 'evidenceSpecificity',
  severity: 'warning',
  reason: requirement.reason,
  suggestion: `补充与岗位要求“${requirement.requirementName}”相关的真实使用场景`,
  confidence: requirement.confidence,
  status: 'confirmed',
});

const profileData = (profile: any) => ({
  id: profile.id,
  jobDescriptionId: profile.job_description_id,
  version: profile.version,
  status: profile.status,
  jobTitle: profile.job_title,
  seniority: profile.seniority,
  industry: profile.industry,
  responsibilities: profile.responsibilities,
  requiredSkills: profile.required_skills,
  preferredSkills: profile.preferred_skills,
  keywords: profile.keywords,
  confidence: profile.confidence,
  parserVersion: profile.parser_version,
  promptVersion: profile.prompt_version,
  modelName: profile.model_name,
  confirmedAt: profile.confirmed_at,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

const jobData = (job: any) => ({
  id: job.id,
  title: job.title,
  company: job.company,
  rawText: job.raw_text,
  sourceUrl: job.source_url,
  createdAt: job.created_at,
  updatedAt: job.updated_at,
  latestProfile: job.profiles?.[0] ? profileData(job.profiles[0]) : null,
});

export const listJobs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const jobs = await prisma.jobDescription.findMany({
      where: { user_id: userId, is_deleted: false },
      orderBy: { updated_at: 'desc' },
      include: { profiles: { orderBy: { version: 'desc' }, take: 1 } },
    });
    return success(res, jobs.map(jobData));
  } catch (cause) {
    console.error('获取目标岗位失败:', cause);
    return error(res, '获取目标岗位失败', 500);
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const input = createJobSchema.safeParse(req.body);
    if (!input.success) return badRequest(res, input.error.issues[0]?.message);
    const job = await prisma.jobDescription.create({
      data: {
        user_id: userId,
        title: input.data.title || null,
        company: input.data.company || null,
        raw_text: input.data.rawText,
        source_url: input.data.sourceUrl || null,
      },
    });
    return created(res, jobData(job), 'JD 保存成功');
  } catch (cause) {
    console.error('保存 JD 失败:', cause);
    return error(res, '保存 JD 失败', 500);
  }
};

export const getJob = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return error(res, '未登录', 401);
  const job = await prisma.jobDescription.findFirst({
    where: { id: req.params.id, user_id: userId, is_deleted: false },
    include: { profiles: { orderBy: { version: 'desc' }, take: 1 } },
  });
  return job ? success(res, jobData(job)) : notFound(res, '目标岗位不存在');
};

export const listJobProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const job = await prisma.jobDescription.findFirst({
      where: { id: req.params.id, user_id: userId, is_deleted: false },
      select: { id: true },
    });
    if (!job) return notFound(res, '目标岗位不存在');
    const profiles = await prisma.jobProfile.findMany({
      where: { job_description_id: job.id, user_id: userId },
      orderBy: { version: 'desc' },
    });
    return success(res, profiles.map(profileData));
  } catch (cause) {
    console.error('获取岗位画像版本失败:', cause);
    return error(res, '获取岗位画像版本失败', 500);
  }
};

export const analyzeJob = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const job = await prisma.jobDescription.findFirst({
      where: { id: req.params.id, user_id: userId, is_deleted: false },
    });
    if (!job) return notFound(res, '目标岗位不存在');

    const parsed = await parseJobDescription(userId, job.raw_text);
    const profile = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const latest = await transaction.jobProfile.findFirst({
        where: { job_description_id: job.id },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      await transaction.jobProfile.updateMany({
        where: { job_description_id: job.id, status: 'draft' },
        data: { status: 'superseded' },
      });
      return transaction.jobProfile.create({
        data: {
          job_description_id: job.id,
          user_id: userId,
          version: (latest?.version || 0) + 1,
          status: 'draft',
          job_title: parsed.jobTitle,
          seniority: parsed.seniority,
          industry: parsed.industry,
          responsibilities: parsed.responsibilities as unknown as Prisma.InputJsonValue,
          required_skills: parsed.requiredSkills as unknown as Prisma.InputJsonValue,
          preferred_skills: parsed.preferredSkills as unknown as Prisma.InputJsonValue,
          keywords: parsed.keywords,
          confidence: parsed.confidence,
          parser_version: JOB_PROFILE_PARSER_VERSION,
          prompt_version: JOB_PROFILE_PROMPT_VERSION,
          model_name: parsed.modelName,
        },
      });
    });
    await prisma.jobDescription.update({
      where: { id: job.id },
      data: { title: job.title || parsed.jobTitle },
    });
    return created(res, profileData(profile), '岗位画像生成成功');
  } catch (cause: any) {
    console.error('岗位画像生成失败:', cause);
    const message = cause?.message?.includes('默认模型')
      ? cause.message
      : '岗位画像生成失败，请检查模型配置或稍后重试';
    return error(res, message, 500);
  }
};

export const updateJobProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const input = updateProfileSchema.safeParse(req.body);
    if (!input.success) return badRequest(res, input.error.issues[0]?.message);
    const existing = await prisma.jobProfile.findFirst({
      where: {
        id: req.params.profileId,
        job_description_id: req.params.id,
        user_id: userId,
      },
      include: { job_description: { select: { raw_text: true } } },
    });
    if (!existing) return notFound(res, '岗位画像不存在');
    if (existing.status !== 'draft') {
      return badRequest(res, '只有待确认的岗位画像可以修改，请重新分析生成新版本');
    }
    try {
      assertProfileEvidence(existing.job_description.raw_text, input.data);
    } catch (cause: any) {
      return badRequest(res, cause.message || '岗位画像的原文证据无效');
    }
    const profile = await prisma.jobProfile.update({
      where: { id: existing.id },
      data: {
        job_title: input.data.jobTitle,
        seniority: input.data.seniority || null,
        industry: input.data.industry || null,
        responsibilities: input.data.responsibilities,
        required_skills: input.data.requiredSkills,
        preferred_skills: input.data.preferredSkills,
        keywords: input.data.keywords,
      },
    });
    return success(res, profileData(profile), '岗位画像已保存');
  } catch (cause) {
    console.error('保存岗位画像失败:', cause);
    return error(res, '保存岗位画像失败', 500);
  }
};

export const confirmJobProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return error(res, '未登录', 401);
  const existing = await prisma.jobProfile.findFirst({
    where: {
      id: req.params.profileId,
      job_description_id: req.params.id,
      user_id: userId,
    },
    include: { job_description: { select: { raw_text: true } } },
  });
  if (!existing) return notFound(res, '岗位画像不存在');
  if (existing.status !== 'draft') {
    return badRequest(res, '只有待确认的岗位画像可以确认');
  }
  try {
    assertProfileEvidence(existing.job_description.raw_text, {
      responsibilities: existing.responsibilities as any,
      requiredSkills: existing.required_skills as any,
      preferredSkills: existing.preferred_skills as any,
    });
  } catch (cause: any) {
    return badRequest(res, cause.message || '岗位画像的原文证据无效');
  }
  const profile = await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
    await transaction.jobProfile.updateMany({
      where: {
        job_description_id: existing.job_description_id,
        status: 'confirmed',
        id: { not: existing.id },
      },
      data: { status: 'superseded' },
    });
    return transaction.jobProfile.update({
      where: { id: existing.id },
      data: { status: 'confirmed', confirmed_at: new Date() },
    });
  });
  return success(res, profileData(profile), '岗位画像已确认');
};

export const analyzeJobResumeAts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const input = atsAnalysisSchema.safeParse(req.body);
    if (!input.success) return badRequest(res, input.error.issues[0]?.message);
    const [job, resume] = await Promise.all([
      prisma.jobDescription.findFirst({
        where: { id: req.params.id, user_id: userId, is_deleted: false },
        select: { id: true },
      }),
      prisma.resume.findFirst({
        where: { id: input.data.resumeId, user_id: userId, is_deleted: false },
        select: { id: true, title: true, content: true, updated_at: true },
      }),
    ]);
    if (!job) return notFound(res, '目标岗位不存在');
    if (!resume) return notFound(res, '简历不存在');
    return success(res, {
      jobDescriptionId: job.id,
      resumeId: resume.id,
      resumeTitle: resume.title,
      resumeUpdatedAt: resume.updated_at,
      ...analyzeResumeForAts(resume.content),
    }, 'ATS 基础分析完成');
  } catch (cause) {
    console.error('ATS 基础分析失败:', cause);
    return error(res, 'ATS 基础分析失败', 500);
  }
};

const matchData = (analysis: any, resumeUpdatedAt: Date, currentProfileId: string) => {
  const requirementMap = new Map(buildMatchRequirements(analysis.job_profile).map((item) => [item.id, item]));
  const requirements = Array.isArray(analysis.requirements) ? analysis.requirements.map((item: any) => {
    const snapshot = requirementMap.get(item.requirementId);
    return { ...item, category: item.category || snapshot?.category, requirementName: item.requirementName || snapshot?.name, jdEvidence: item.jdEvidence || snapshot?.jdEvidence };
  }) : [];
  return ({
  id: analysis.id, jobDescriptionId: analysis.job_profile.job_description_id,
  jobProfileId: analysis.job_profile_id, jobProfileVersion: analysis.job_profile.version,
  resumeId: analysis.resume_id, resumeUpdatedAt: analysis.resume_updated_at,
  score: analysis.score, dimensions: analysis.dimensions, requirements,
  overallConfidence: analysis.overall_confidence, modelName: analysis.model_name,
  promptVersion: analysis.prompt_version, evaluatorVersion: analysis.evaluator_version,
  createdAt: analysis.created_at,
  stale: analysis.resume_updated_at.getTime() !== resumeUpdatedAt.getTime() || analysis.job_profile_id !== currentProfileId,
  });
};

export const analyzeJobResumeMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const input = atsAnalysisSchema.safeParse(req.body);
    if (!input.success) return badRequest(res, input.error.issues[0]?.message);
    const profile = await prisma.jobProfile.findFirst({
      where: { job_description_id: req.params.id, user_id: userId, status: 'confirmed', job_description: { is_deleted: false } },
      orderBy: { confirmed_at: 'desc' },
    });
    if (!profile) return badRequest(res, '请先确认当前岗位画像，再运行岗位匹配');
    const resume = await prisma.resume.findFirst({ where: { id: input.data.resumeId, user_id: userId, is_deleted: false } });
    if (!resume) return notFound(res, '简历不存在');
    const result = await evaluateJobMatch(userId, profile, resume.content);
    const analysis = await prisma.jobMatchAnalysis.create({ data: {
      user_id: userId, resume_id: resume.id, resume_updated_at: resume.updated_at, job_profile_id: profile.id,
      score: result.score, dimensions: result.dimensions as unknown as Prisma.InputJsonValue,
      requirements: result.requirements as unknown as Prisma.InputJsonValue, overall_confidence: result.overallConfidence,
      model_name: result.modelName, prompt_version: result.promptVersion, evaluator_version: result.evaluatorVersion,
    }, include: { job_profile: true } });
    return success(res, matchData(analysis, resume.updated_at, profile.id), '岗位匹配完成');
  } catch (cause: any) {
    console.error('岗位匹配失败:', cause);
    return error(res, cause?.message?.includes('默认模型') ? cause.message : '岗位匹配失败，请检查模型配置或稍后重试', 500);
  }
};

export const getLatestJobResumeMatch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const input = atsAnalysisSchema.safeParse({ resumeId: req.query.resumeId });
    if (!input.success) return badRequest(res, input.error.issues[0]?.message);
    const [resume, profile] = await Promise.all([
      prisma.resume.findFirst({ where: { id: input.data.resumeId, user_id: userId, is_deleted: false }, select: { id: true, updated_at: true } }),
      prisma.jobProfile.findFirst({ where: { job_description_id: req.params.id, user_id: userId, status: 'confirmed' }, orderBy: { confirmed_at: 'desc' }, select: { id: true } }),
    ]);
    if (!resume) return notFound(res, '简历不存在');
    if (!profile) return success(res, null);
    const analysis = await prisma.jobMatchAnalysis.findFirst({ where: { user_id: userId, resume_id: resume.id, job_profile: { job_description_id: req.params.id } }, orderBy: { created_at: 'desc' }, include: { job_profile: true } });
    return success(res, analysis ? matchData(analysis, resume.updated_at, profile.id) : null);
  } catch (cause) { console.error('获取岗位匹配报告失败:', cause); return error(res, '获取岗位匹配报告失败', 500); }
};

export const optimizeJobMatchRequirement = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const input = matchOptimizationSchema.safeParse(req.body);
    if (!input.success) return badRequest(res, input.error.issues[0]?.message);
    const analysis = await prisma.jobMatchAnalysis.findFirst({
      where: { id: input.data.analysisId, user_id: userId, job_profile: { job_description_id: req.params.id } },
      include: { resume: true, job_profile: true },
    });
    if (!analysis) return notFound(res, '岗位匹配报告不存在');
    const latest = await prisma.jobMatchAnalysis.findFirst({ where: { user_id: userId, resume_id: analysis.resume_id, job_profile: { job_description_id: req.params.id } }, orderBy: { created_at: 'desc' } });
    if (latest?.id !== analysis.id || analysis.resume.updated_at.getTime() !== analysis.resume_updated_at.getTime() || analysis.job_profile.status !== 'confirmed') return error(res, '岗位匹配报告已过期，请重新匹配后再优化', 409);
    const requirements = Array.isArray(analysis.requirements) ? analysis.requirements as any[] : [];
    const requirement = requirements[input.data.requirementIndex];
    if (!requirement) return notFound(res, '岗位匹配要求不存在');
    if (requirement.status !== 'insufficient_evidence' || !requirement.resumeFieldId || !requirement.resumeEvidence || !requirement.section || !requirement.field) return badRequest(res, '仅支持优化可定位的“证据不足”问题');
    const result = await generateJobMatchOptimization(userId, requirement, input.data.userFacts);
    const suggestionToken = result.mode === 'suggestion' ? createSuggestionToken({ userId, resumeId: analysis.resume_id, source: 'job_match', targetId: `${analysis.id}:${requirement.requirementId}`, fieldId: requirement.resumeFieldId, originalText: result.originalText, suggestedText: result.suggestedText }) : undefined;
    return success(res, { analysisId: analysis.id, requirementIndex: input.data.requirementIndex, fieldId: requirement.resumeFieldId, requirementName: requirement.requirementName, jdEvidence: requirement.jdEvidence, ...result, suggestionToken });
  } catch (cause) {
    console.error('生成岗位匹配优化建议失败:', cause);
    return error(res, '生成岗位匹配优化建议失败，请稍后重试', 500);
  }
};

export const applyJobMatchOptimization = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, '未登录', 401);
    const input = applyMatchOptimizationSchema.safeParse(req.body);
    if (!input.success) return badRequest(res, input.error.issues[0]?.message);
    const result = await prisma.$transaction(async (tx: any) => {
      const analysis = await tx.jobMatchAnalysis.findFirst({ where: { id: input.data.analysisId, user_id: userId, job_profile: { job_description_id: req.params.id } }, include: { resume: true, job_profile: true } });
      if (!analysis) throw Object.assign(new Error('岗位匹配报告不存在'), { statusCode: 404 });
      const latest = await tx.jobMatchAnalysis.findFirst({ where: { user_id: userId, resume_id: analysis.resume_id, job_profile: { job_description_id: req.params.id } }, orderBy: { created_at: 'desc' } });
      if (latest?.id !== analysis.id || analysis.resume.updated_at.getTime() !== analysis.resume_updated_at.getTime() || analysis.job_profile.status !== 'confirmed') throw Object.assign(new Error('岗位匹配报告已过期，请重新匹配后再应用'), { statusCode: 409 });
      const requirements = Array.isArray(analysis.requirements) ? analysis.requirements as any[] : [];
      const requirement = requirements[input.data.requirementIndex];
      if (!requirement || requirement.status !== 'insufficient_evidence' || !requirement.resumeFieldId || !requirement.resumeEvidence || !requirement.section || !requirement.field) throw Object.assign(new Error('仅支持应用可定位的“证据不足”建议'), { statusCode: 400 });
      let content: unknown;
      try { content = applyContentQualitySuggestion(analysis.resume.content, matchRequirementIssue(requirement), input.data.suggestedText); }
      catch (cause: any) { throw Object.assign(cause, { statusCode: 409 }); }
      const version = await tx.resumeVersion.create({ data: { user_id: userId, resume_id: analysis.resume.id, title: analysis.resume.title, content: analysis.resume.content, source: 'job_match_optimization', change_summary: `${requirement.resumeFieldId}: ${requirement.requirementName}` } });
      const resume = await tx.resume.update({ where: { id: analysis.resume.id }, data: { content: content as Prisma.InputJsonValue, updated_at: new Date() } });
      const action = await tx.resumeOptimizationAction.create({ data: optimizationActionData({ userId, resumeId: analysis.resume.id, versionId: version.id, source: 'job_match', targetId: `${analysis.id}:${requirement.requirementId}`, fieldId: requirement.resumeFieldId, originalText: requirement.resumeEvidence, finalText: input.data.suggestedText, reason: requirement.reason, evidence: requirement.jdEvidence, scoreBefore: analysis.score }) });
      return { versionId: version.id, actionId: action.id, resume, fieldId: requirement.resumeFieldId };
    });
    return success(res, result);
  } catch (cause: any) {
    console.error('应用岗位匹配优化建议失败:', cause);
    return error(res, cause?.message || '应用岗位匹配优化建议失败', cause?.statusCode || 500);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return error(res, '未登录', 401);
  const result = await prisma.jobDescription.updateMany({
    where: { id: req.params.id, user_id: userId, is_deleted: false },
    data: { is_deleted: true },
  });
  return result.count
    ? success(res, null, '目标岗位已删除')
    : notFound(res, '目标岗位不存在');
};
