import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';
import { analyzeResumeForAts } from '../services/ats-analysis.service';

const baseUrl = process.env.STAGE4_E2E_BASE_URL || 'http://localhost:4000/api';
const userId = crypto.randomUUID();
const resumeId = crypto.randomUUID();
const originalSummary = 'testtest';
const optimizedSummary = '五年后端开发经验，专注高并发服务设计、缓存治理与性能优化。';

const initialContent = {
  basicInfo: { name: '阶段四验收用户', email: 'stage4@example.com', summary: originalSummary },
  education: [], experience: [], projects: [], skills: [],
};

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', cookie: `token=${token}`, ...options.headers },
  });
  const body = await response.json() as any;
  return { status: response.status, body };
}

const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });

try {
  await prisma.user.create({ data: { id: userId, github_id: `stage4-e2e-${userId}`, github_login: `stage4-e2e-${userId}` } });
  await prisma.resume.create({ data: { id: resumeId, user_id: userId, title: '阶段 4 隔离验收简历', content: initialContent } });

  const issue = analyzeResumeForAts(initialContent).issues.find((item) => item.field === 'summary');
  assert.ok(issue, '固定简历应产生 summary ATS 问题');

  const applied = await api(`/resume/${resumeId}/ats/apply`, { method: 'POST', body: JSON.stringify({ issueId: issue.id, suggestedText: optimizedSummary }) });
  assert.equal(applied.body.code, 200, applied.body.message);
  const firstActionId = applied.body.data.actionId as string;
  assert.equal(applied.body.data.resume.content.basicInfo.summary, optimizedSummary);

  const history = await api(`/resume/${resumeId}/optimizations?source=ats&status=accepted`);
  assert.equal(history.body.code, 200, history.body.message);
  assert.equal(history.body.data.items[0].id, firstActionId);
  assert.equal(history.body.data.items[0].reason, issue.message);
  assert.equal(history.body.data.items[0].canRevert, true);

  const refreshedHistory = await api(`/resume/${resumeId}/optimizations?source=ats&status=accepted`);
  assert.equal(refreshedHistory.body.data.items[0].id, firstActionId, '刷新后历史记录应保持一致');

  const reverted = await api(`/resume/${resumeId}/optimizations/${firstActionId}/revert`, { method: 'POST' });
  assert.equal(reverted.body.code, 200, reverted.body.message);
  assert.equal(reverted.body.data.resume.content.basicInfo.summary, originalSummary);
  assert.equal(reverted.body.data.action.status, 'reverted');
  assert.equal(reverted.body.data.revertAction.actionType, 'revert');
  assert.equal(reverted.body.data.revertAction.parentActionId, firstActionId);

  const repeated = await api(`/resume/${resumeId}/optimizations/${firstActionId}/revert`, { method: 'POST' });
  assert.equal(repeated.body.code, 409, '重复撤销应被拒绝');

  const reapplied = await api(`/resume/${resumeId}/ats/apply`, { method: 'POST', body: JSON.stringify({ issueId: issue.id, suggestedText: optimizedSummary }) });
  assert.equal(reapplied.body.code, 200, reapplied.body.message);
  const secondActionId = reapplied.body.data.actionId as string;
  const manuallyEdited = structuredClone(reapplied.body.data.resume.content);
  manuallyEdited.basicInfo.summary = '用户在应用建议后手动补充了新的个人概述，不能被旧优化记录覆盖。';
  const saved = await api(`/resume/${resumeId}`, { method: 'PUT', body: JSON.stringify({ title: '阶段 4 隔离验收简历', content: manuallyEdited }) });
  assert.equal(saved.body.code, 200, saved.body.message);

  const conflicted = await api(`/resume/${resumeId}/optimizations/${secondActionId}/revert`, { method: 'POST' });
  assert.equal(conflicted.body.code, 409, '后续编辑后撤销应触发冲突保护');
  const finalResume = await api(`/resume/${resumeId}`);
  assert.equal(finalResume.body.data.content.basicInfo.summary, manuallyEdited.basicInfo.summary, '冲突撤销不得覆盖后续编辑');

  console.log('阶段 4 E2E 验收通过：应用、历史刷新、撤销、重复撤销保护、后续编辑冲突保护。');
} finally {
  await prisma.user.deleteMany({ where: { id: userId } });
  await prisma.$disconnect();
}
