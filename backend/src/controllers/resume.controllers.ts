import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../database/prisma';
import {
  generateThumbnail,
  ensureThumbnailDirExists,
  getThumbnailPath,
} from '../services/thumbnail.service';
import { success, error } from '../utils/response';
import { evaluateResumeContent, hashResumeContent } from '../services/content-quality.service';
import { generateResumeOptimization } from '../services/resume-optimization.service';
import { applyContentQualitySuggestion } from '../services/resume-version.service';
import { analyzeResumeForAts } from '../services/ats-analysis.service';
import { resolveAtsOptimizationField } from '../services/ats-optimization.service';
import { optimizationActionData } from '../services/optimization-action.service';
import type { ContentQualityIssue } from '../types/content-quality.types';

const optimizationSchema = z.object({ analysisId: z.string().uuid(), issueIndex: z.number().int().min(0), userFacts: z.string().trim().max(4000).optional().default('') });
const applyOptimizationSchema = z.object({
  analysisId: z.string().uuid(),
  issueIndex: z.number().int().min(0),
  suggestedText: z.string().trim().min(1).max(4000),
});
const atsOptimizationSchema = z.object({ issueId: z.string().trim().min(1).max(300), userFacts: z.string().trim().max(4000).optional().default('') });
const applyAtsOptimizationSchema = z.object({ issueId: z.string().trim().min(1).max(300), suggestedText: z.string().trim().min(1).max(4000) });
const optimizationResultSchema = z.object({ analysisId: z.string().uuid() });

const atsContentIssue = (issue: any, field: any): ContentQualityIssue => ({ fieldId: field.fieldId, section: field.section, itemId: field.itemId, field: field.field, evidence: field.content, dimension: 'professionalism', severity: issue.severity, reason: issue.message, suggestion: issue.title, confidence: 1, status: 'confirmed' });

const contentAnalysisData = (analysis: any, currentResumeUpdatedAt?: Date) => ({
  id: analysis.id,
  resumeId: analysis.resume_id,
  resumeUpdatedAt: analysis.resume_updated_at,
  score: analysis.score,
  dimensions: analysis.dimensions,
  issues: analysis.issues,
  overallConfidence: analysis.overall_confidence,
  modelName: analysis.model_name,
  promptVersion: analysis.prompt_version,
  evaluatorVersion: analysis.evaluator_version,
  createdAt: analysis.created_at,
  stale: currentResumeUpdatedAt
    ? analysis.resume_updated_at.getTime() !== currentResumeUpdatedAt.getTime()
    : false,
});

export const analyzeResumeContentQuality = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, user_id: userId, is_deleted: false },
    });
    if (!resume) return error(res, '简历不存在', 404);
    const result = await evaluateResumeContent(userId, resume.content);
    const analysis = await prisma.resumeContentAnalysis.create({
      data: {
        user_id: userId,
        resume_id: resume.id,
        resume_updated_at: resume.updated_at,
        content_hash: hashResumeContent(resume.content),
        score: result.score,
        dimensions: result.dimensions as unknown as Prisma.InputJsonValue,
        issues: result.issues as unknown as Prisma.InputJsonValue,
        overall_confidence: result.overallConfidence,
        model_name: result.modelName,
        prompt_version: result.promptVersion,
        evaluator_version: result.evaluatorVersion,
      },
    });
    return res.status(201).json({ code: 200, message: '内容质量评价完成', data: contentAnalysisData(analysis, resume.updated_at) });
  } catch (cause: any) {
    console.error('内容质量评价失败:', cause);
    const message = cause?.message?.includes('默认模型') || cause?.message?.includes('可评价')
      ? cause.message
      : '内容质量评价失败，请检查模型配置或稍后重试';
    return error(res, message, 500);
  }
};

export const getLatestResumeContentQuality = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, user_id: userId, is_deleted: false },
      select: { id: true, updated_at: true },
    });
    if (!resume) return error(res, '简历不存在', 404);
    const analysis = await prisma.resumeContentAnalysis.findFirst({
      where: { resume_id: resume.id, user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return success(res, analysis ? contentAnalysisData(analysis, resume.updated_at) : null);
  } catch (cause) {
    console.error('获取内容质量评价失败:', cause);
    return error(res, '获取内容质量评价失败', 500);
  }
};

export const optimizeResumeContentIssue = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const input = optimizationSchema.safeParse(req.body);
    if (!input.success) return error(res, input.error.issues[0]?.message || '请求无效', 400);
    const resume = await prisma.resume.findFirst({ where: { id: req.params.id, user_id: userId, is_deleted: false }, select: { id: true, updated_at: true } });
    if (!resume) return error(res, '简历不存在', 404);
    const latest = await prisma.resumeContentAnalysis.findFirst({ where: { resume_id: resume.id, user_id: userId }, orderBy: { created_at: 'desc' } });
    if (!latest || latest.id !== input.data.analysisId) return error(res, '该问题不是最新内容质量报告，请重新评价后再优化', 409);
    if (latest.resume_updated_at.getTime() !== resume.updated_at.getTime()) return error(res, '简历已修改，请重新评价后再优化', 409);
    const issues = Array.isArray(latest.issues) ? latest.issues as unknown as ContentQualityIssue[] : [];
    const issue = issues[input.data.issueIndex];
    if (!issue) return error(res, '内容质量问题不存在', 404);
    const result = await generateResumeOptimization(userId, issue, input.data.userFacts);
    return success(res, { analysisId: latest.id, issueIndex: input.data.issueIndex, fieldId: issue.fieldId, ...result });
  } catch (cause) {
    console.error('生成局部优化建议失败:', cause);
    return error(res, '生成局部优化建议失败，请稍后重试', 500);
  }
};

export const applyResumeContentOptimization = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const input = applyOptimizationSchema.safeParse(req.body);
    if (!input.success) return error(res, input.error.issues[0]?.message || '请求无效', 400);

    const result = await prisma.$transaction(async (tx: any) => {
      const resume = await tx.resume.findFirst({
        where: { id: req.params.id, user_id: userId, is_deleted: false },
      });
      if (!resume) throw Object.assign(new Error('简历不存在'), { statusCode: 404 });
      const latest = await tx.resumeContentAnalysis.findFirst({
        where: { resume_id: resume.id, user_id: userId },
        orderBy: { created_at: 'desc' },
      });
      if (!latest || latest.id !== input.data.analysisId || latest.resume_updated_at.getTime() !== resume.updated_at.getTime()) {
        throw Object.assign(new Error('简历或分析报告已变化，请重新评价后再应用'), { statusCode: 409 });
      }
      const issues = Array.isArray(latest.issues) ? latest.issues as unknown as ContentQualityIssue[] : [];
      const issue = issues[input.data.issueIndex];
      if (!issue) throw Object.assign(new Error('内容质量问题不存在'), { statusCode: 404 });

      let updatedContent: unknown;
      try {
        updatedContent = applyContentQualitySuggestion(resume.content, issue, input.data.suggestedText);
      } catch (cause: any) {
        throw Object.assign(cause, { statusCode: 409 });
      }
      const version = await tx.resumeVersion.create({
        data: {
          user_id: userId,
          resume_id: resume.id,
          title: resume.title,
          content: resume.content,
          source: 'content_quality_optimization',
          change_summary: `${issue.fieldId}: ${issue.reason}`,
        },
      });
      const updatedResume = await tx.resume.update({
        where: { id: resume.id },
        data: { content: updatedContent as Prisma.InputJsonValue, updated_at: new Date() },
      });
      const action = await tx.resumeOptimizationAction.create({ data: optimizationActionData({ userId, resumeId: resume.id, versionId: version.id, source: 'content_quality', targetId: `${latest.id}:${input.data.issueIndex}`, fieldId: issue.fieldId, originalText: issue.evidence, finalText: input.data.suggestedText, scoreBefore: latest.score }) });
      return { versionId: version.id, actionId: action.id, resume: updatedResume, fieldId: issue.fieldId };
    });
    return success(res, result);
  } catch (cause: any) {
    console.error('应用局部优化建议失败:', cause);
    return error(res, cause?.message || '应用局部优化建议失败', cause?.statusCode || 500);
  }
};

export const optimizeResumeAtsIssue = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const input = atsOptimizationSchema.safeParse(req.body);
    if (!input.success) return error(res, input.error.issues[0]?.message || '请求无效', 400);
    const resume = await prisma.resume.findFirst({ where: { id: req.params.id, user_id: userId, is_deleted: false } });
    if (!resume) return error(res, '简历不存在', 404);
    const issue = analyzeResumeForAts(resume.content).issues.find((item) => item.id === input.data.issueId);
    if (!issue) return error(res, '该 ATS 问题已不存在，请重新运行结构初检', 409);
    let field;
    try { field = resolveAtsOptimizationField(resume.content, issue); }
    catch (cause: any) { return error(res, cause.message, 400); }
    if (!input.data.userFacts.trim()) return success(res, { mode: 'needs_input', issueId: issue.id, fieldId: field.fieldId, originalText: field.content, questions: ['这个字段应表达哪些真实信息？', '有哪些可确认的名称、方向或事实可以替换当前无意义内容？'] });
    const result = await generateResumeOptimization(userId, atsContentIssue(issue, field), input.data.userFacts);
    return success(res, { issueId: issue.id, fieldId: field.fieldId, ...result });
  } catch (cause) { console.error('生成 ATS 优化建议失败:', cause); return error(res, '生成 ATS 优化建议失败，请稍后重试', 500); }
};

export const applyResumeAtsOptimization = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const input = applyAtsOptimizationSchema.safeParse(req.body);
    if (!input.success) return error(res, input.error.issues[0]?.message || '请求无效', 400);
    const result = await prisma.$transaction(async (tx: any) => {
      const resume = await tx.resume.findFirst({ where: { id: req.params.id, user_id: userId, is_deleted: false } });
      if (!resume) throw Object.assign(new Error('简历不存在'), { statusCode: 404 });
      const issue = analyzeResumeForAts(resume.content).issues.find((item) => item.id === input.data.issueId);
      if (!issue) throw Object.assign(new Error('该 ATS 问题已不存在，请重新运行结构初检'), { statusCode: 409 });
      let field;
      try { field = resolveAtsOptimizationField(resume.content, issue); }
      catch (cause: any) { throw Object.assign(cause, { statusCode: 400 }); }
      let content;
      try { content = applyContentQualitySuggestion(resume.content, atsContentIssue(issue, field), input.data.suggestedText); }
      catch (cause: any) { throw Object.assign(cause, { statusCode: 409 }); }
      const version = await tx.resumeVersion.create({ data: { user_id: userId, resume_id: resume.id, title: resume.title, content: resume.content, source: 'ats_optimization', change_summary: `${field.fieldId}: ${issue.title}` } });
      const updatedResume = await tx.resume.update({ where: { id: resume.id }, data: { content: content as Prisma.InputJsonValue, updated_at: new Date() } });
      const before = analyzeResumeForAts(resume.content); const after = analyzeResumeForAts(content); const resolved = !after.issues.some((item) => item.id === issue.id);
      const action = await tx.resumeOptimizationAction.create({ data: optimizationActionData({ userId, resumeId: resume.id, versionId: version.id, source: 'ats', targetId: issue.id, fieldId: field.fieldId, originalText: field.content, finalText: input.data.suggestedText, scoreBefore: before.score, scoreAfter: after.score, resolved }) });
      return { versionId: version.id, actionId: action.id, resume: updatedResume, fieldId: field.fieldId, previousScore: before.score, ats: after };
    });
    return success(res, result);
  } catch (cause: any) { console.error('应用 ATS 优化建议失败:', cause); return error(res, cause?.message || '应用 ATS 优化建议失败', cause?.statusCode || 500); }
};

export const restoreResumeVersion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const result = await prisma.$transaction(async (tx: any) => {
      const resume = await tx.resume.findFirst({ where: { id: req.params.id, user_id: userId, is_deleted: false } });
      if (!resume) throw Object.assign(new Error('简历不存在'), { statusCode: 404 });
      const version = await tx.resumeVersion.findFirst({ where: { id: req.params.versionId, resume_id: resume.id, user_id: userId } });
      if (!version) throw Object.assign(new Error('简历版本不存在'), { statusCode: 404 });
      await tx.resumeVersion.create({ data: { user_id: userId, resume_id: resume.id, title: resume.title, content: resume.content, source: 'before_restore', change_summary: `恢复至版本 ${version.id}` } });
      await tx.resumeOptimizationAction.updateMany({ where: { version_id: version.id, user_id: userId, status: 'accepted' }, data: { status: 'reverted' } });
      return tx.resume.update({ where: { id: resume.id }, data: { title: version.title, content: version.content, updated_at: new Date() } });
    });
    return success(res, result);
  } catch (cause: any) {
    console.error('恢复简历版本失败:', cause);
    return error(res, cause?.message || '恢复简历版本失败', cause?.statusCode || 500);
  }
};

export const completeResumeOptimizationAction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);
    const input = optimizationResultSchema.safeParse(req.body);
    if (!input.success) return error(res, '分析记录无效', 400);
    const action = await prisma.resumeOptimizationAction.findFirst({ where: { id: req.params.actionId, user_id: userId, resume_id: req.params.id } });
    if (!action) return error(res, '优化记录不存在', 404);
    if (action.source === 'content_quality') {
      const analysis = await prisma.resumeContentAnalysis.findFirst({ where: { id: input.data.analysisId, user_id: userId, resume_id: action.resume_id } });
      if (!analysis) return error(res, '内容质量分析不存在', 404);
      const issues = Array.isArray(analysis.issues) ? analysis.issues as any[] : [];
      const updated = await prisma.resumeOptimizationAction.update({ where: { id: action.id }, data: { score_after: analysis.score, resolved: !issues.some((item) => item.fieldId === action.field_id) } });
      return success(res, updated);
    }
    if (action.source === 'job_match') {
      const analysis = await prisma.jobMatchAnalysis.findFirst({ where: { id: input.data.analysisId, user_id: userId, resume_id: action.resume_id } });
      if (!analysis) return error(res, '岗位匹配分析不存在', 404);
      const requirementId = action.target_id.split(':').slice(-2).join(':');
      const requirements = Array.isArray(analysis.requirements) ? analysis.requirements as any[] : [];
      const requirement = requirements.find((item) => item.requirementId === requirementId);
      const updated = await prisma.resumeOptimizationAction.update({ where: { id: action.id }, data: { score_after: analysis.score, resolved: requirement?.status === 'matched' } });
      return success(res, updated);
    }
    return error(res, '该优化记录无需异步回填', 400);
  } catch (cause) { console.error('回填优化结果失败:', cause); return error(res, '回填优化结果失败', 500); }
};

export const createResume = async (req: Request, res: Response) => {
  try {
    const { template_id, title, content } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    // Prisma Json 类型会自动处理序列化，不需要手动调用 JSON.stringify
    const resume = await prisma.resume.create({
      data: {
        user_id: userId,
        template_id,
        title,
        content,
      },
    });

    // 生成缩略图时需要确保 content 是对象
    const contentForThumbnail =
      typeof content === 'string' ? JSON.parse(content) : content;
    await generateResumeThumbnail(resume.id, contentForThumbnail);

    return res
      .status(201)
      .json({ code: 200, message: '创建成功', data: resume });
  } catch (err: any) {
    console.error('创建简历失败:', err);
    return error(res, '创建失败');
  }
};

export const updateResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return error(res, '简历不存在', 404);
    }

    if (existingResume.user_id !== userId) {
      return error(res, '无权操作', 403);
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        title,
        content,
        updated_at: new Date(),
      },
    });

    // 生成缩略图时需要确保 content 是对象
    const contentForThumbnail =
      typeof content === 'string' ? JSON.parse(content) : content;
    await generateResumeThumbnail(id, contentForThumbnail);

    return res.json({ code: 200, message: '更新成功', data: resume });
  } catch (err: any) {
    console.error('更新简历失败:', err);
    return error(res, '更新失败');
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const existingResume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!existingResume) {
      return error(res, '简历不存在', 404);
    }

    if (existingResume.user_id !== userId) {
      return error(res, '无权操作', 403);
    }

    await prisma.resume.update({
      where: { id },
      data: { is_deleted: true, updated_at: new Date() },
    });

    return res.json({ code: 200, message: '删除成功', data: null });
  } catch (err: any) {
    console.error('删除简历失败:', err);
    return error(res, '删除失败');
  }
};

export const exportResumePdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    if (!userId) return error(res, '未授权', 401);

    const resume = await prisma.resume.findFirst({
      where: { id, user_id: userId, is_deleted: false },
    });
    if (!resume) return error(res, '简历不存在', 404);

    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

      const frontendUrl = (
        process.env.PDF_RENDER_URL ||
        process.env.CORS_ORIGIN?.split(',')[0] ||
        'http://localhost:5173'
      ).replace(/\/$/, '');
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        await page.setExtraHTTPHeaders({ cookie: cookieHeader });
      }

      const printUrl = `${frontendUrl}/resume/${encodeURIComponent(id)}/print`;
      await page.goto(printUrl, { waitUntil: 'networkidle0' });
      await Promise.race([
        page.waitForSelector('[data-resume-preview-ready="true"]', {
          timeout: 30_000,
        }),
        page.waitForSelector('[data-resume-print-error]', { timeout: 30_000 }).then(
          () => {
            throw new Error('打印页面无法加载简历');
          }
        ),
      ]);
      await page.evaluate(async () => {
        const browserGlobal = globalThis as any;
        await browserGlobal.document.fonts.ready;
        await new Promise<void>((resolve) =>
          browserGlobal.requestAnimationFrame(() =>
            browserGlobal.requestAnimationFrame(() => resolve())
          )
        );
      });
      await page.emulateMediaType('print');
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });
      const filename = `${resume.title.replace(/[\\/:*?"<>|]/g, '_') || 'resume'}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      res.setHeader('Content-Length', pdf.length);
      return res.send(pdf);
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error('导出 PDF 失败:', err);
    return error(res, '导出 PDF 失败');
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const resume = await prisma.resume.findUnique({
      where: { id, is_deleted: false },
    });

    if (!resume) {
      return error(res, '简历不存在', 404);
    }

    if (resume.user_id !== userId) {
      return error(res, '无权查看', 403);
    }

    // Prisma Json 类型会自动解析，不需要手动 JSON.parse
    // 但为了兼容可能存在的旧数据（双重序列化），进行检查
    const content =
      typeof resume.content === 'string'
        ? JSON.parse(resume.content)
        : resume.content;

    return res.json({
      code: 200,
      message: 'Success',
      data: {
        ...resume,
        content: typeof content === 'string' ? JSON.parse(content) : content, // 处理双重序列化
      },
    });
  } catch (err: any) {
    console.error('获取简历失败:', err);
    return error(res, '获取失败');
  }
};

export const getUserResumes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return error(res, '未授权', 401);
    }

    const excludeUploaded = (req.query.excludeUploaded as string) === 'true';

    const where: any = { user_id: userId, is_deleted: false };

    const resumes = await prisma.resume.findMany({
      where,
      orderBy: { updated_at: 'desc' },
    });

    const result = resumes
      .filter((r: any) => {
        if (!excludeUploaded) return true;
        const content =
          typeof r.content === 'string' ? JSON.parse(r.content) : r.content;
        return content.isUploadedFile !== true;
      })
      .map((resume: any) => {
        const content =
          typeof resume.content === 'string'
            ? JSON.parse(resume.content)
            : resume.content;
        return {
          ...resume,
          content,
        };
      });

    return res.json({ code: 200, message: 'Success', data: result });
  } catch (err: any) {
    console.error('获取简历列表失败:', err);
    return error(res, '获取失败');
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await import('../services/template.service').then((m) =>
      m.getTemplatesWithImages()
    );
    return res.json({ code: 200, message: 'Success', data: templates });
  } catch (err: any) {
    console.error('获取模板列表失败:', err);
    return error(res, '获取失败');
  }
};

export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await prisma.template.findUnique({
      where: { id, is_deleted: false },
    });

    if (!template) {
      return error(res, '模板不存在', 404);
    }

    const schema =
      typeof template.schema === 'string'
        ? JSON.parse(template.schema)
        : template.schema;
    const styleConfig =
      typeof template.style_config === 'string'
        ? JSON.parse(template.style_config)
        : template.style_config;

    return res.json({
      code: 200,
      message: 'Success',
      data: {
        ...template,
        schema,
        style_config: styleConfig,
      },
    });
  } catch (err: any) {
    console.error('获取模板失败:', err);
    return error(res, '获取失败');
  }
};

async function generateResumeThumbnail(resumeId: string, content: any) {
  try {
    await ensureThumbnailDirExists();
    const thumbnailPath = getThumbnailPath(resumeId);

    const htmlContent = generateResumeHtml(content);
    await generateThumbnail(htmlContent, thumbnailPath);

    console.log(`缩略图已生成: ${thumbnailPath}`);
  } catch (error) {
    console.error('生成缩略图失败:', error);
  }
}

function generateResumeHtml(content: any): string {
  const blocks = content?.blocks || [];

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; padding: 20px; background: #fff; width: 100%; }
        .container { width: 100%; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .name { font-size: 24px; font-weight: bold; }
        .title { color: #666; margin: 5px 0; }
        .contact { font-size: 11px; color: #666; }
        .section { margin-bottom: 15px; }
        .section-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 3px; }
        .item { margin-bottom: 10px; }
        .item-header { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .item-title { font-weight: bold; }
        .item-subtitle { color: #666; }
        .item-date { color: #999; font-size: 10px; }
        .item-desc { font-size: 11px; color: #555; }
        .skills { display: flex; flex-wrap: wrap; gap: 5px; }
        .skill-tag { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
  `;

  for (const block of blocks) {
    switch (block.type) {
      case 'basic': {
        const data = block.data;
        html += `
          <div class="header">
            <div class="name">${data.name || '姓名'}</div>
            <div class="title">${data.title || ''}</div>
            <div class="contact">
              ${data.email ? `📧 ${data.email} | ` : ''}
              ${data.phone ? `📱 ${data.phone} | ` : ''}
              ${data.location ? `📍 ${data.location}` : ''}
            </div>
            ${data.bio ? `<div class="item-desc" style="margin-top: 10px;">${data.bio}</div>` : ''}
          </div>
        `;
        break;
      }
      case 'objective': {
        html += `
          <div class="section">
            <div class="section-title">🎯 职业目标</div>
            <div class="item-desc">${block.data?.objective || '暂无职业目标'}</div>
          </div>
        `;
        break;
      }
      case 'education': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">🎓 教育背景</div>`;
        items.forEach((item: any) => {
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.school}</span>
                <span class="item-date">${item.startDate} - ${item.endDate}</span>
              </div>
              <div class="item-subtitle">${item.major} | ${item.degree}</div>
              ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
        break;
      }
      case 'experience': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">💼 工作经历</div>`;
        items.forEach((item: any) => {
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.company}</span>
                <span class="item-date">${item.startDate} - ${item.endDate}</span>
              </div>
              <div class="item-subtitle">${item.position}</div>
              ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
        break;
      }
      case 'projects': {
        const items = Array.isArray(block.data) ? block.data : [];
        html += `<div class="section"><div class="section-title">🚀 项目经验</div>`;
        items.forEach((item: any) => {
          html += `
            <div class="item">
              <div class="item-header">
                <span class="item-title">${item.name}</span>
                <span class="item-date">${item.startDate} - ${item.endDate}</span>
              </div>
              <div class="item-subtitle">${item.role}</div>
              ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
              ${item.techStack ? `<div class="skills">${item.techStack.map((t: string) => `<span class="skill-tag">${t}</span>`).join('')}</div>` : ''}
            </div>
          `;
        });
        html += `</div>`;
        break;
      }
      case 'skills': {
        const skills = Array.isArray(block.data) ? block.data : [];
        html += `
          <div class="section">
            <div class="section-title">🛠️ 专业技能</div>
            <div class="skills">
              ${skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        `;
        break;
      }
      case 'certifications': {
        const certs = block.data?.certifications || [];
        html += `
          <div class="section">
            <div class="section-title">🏆 证书荣誉</div>
            <div class="skills">
              ${certs.map((cert: string) => `<span class="skill-tag">${cert}</span>`).join('')}
            </div>
          </div>
        `;
        break;
      }
    }
  }

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}
