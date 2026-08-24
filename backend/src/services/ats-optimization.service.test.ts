import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveAtsOptimizationField } from './ats-optimization.service';
import { analyzeResumeForAts } from './ats-analysis.service';
import { applyContentQualitySuggestion } from './resume-version.service';

test('解析可定位的技能字段', () => {
  const field = resolveAtsOptimizationField(
    { skills: [{ id: 's1', name: 'testtest' }] },
    { section: 'skills', itemId: 's1', field: 'name' } as any
  );
  assert.equal(field.fieldId, 'skills:s1:name');
});
test('拒绝模块级聚合问题', () => {
  assert.throws(
    () =>
      resolveAtsOptimizationField({ experience: [] }, {
        section: 'experience',
        itemId: null,
        field: 'description',
      } as any),
    /结构化编辑/
  );
});
test('从 ATS 问题到应用和重评分形成闭环', () => {
  const content = {
    basicInfo: { name: '张三', email: 'a@example.com', summary: 'testtest' },
    education: [],
    experience: [],
    projects: [],
    skills: [],
  };
  const before = analyzeResumeForAts(content);
  const issue = before.issues.find((item) => item.field === 'summary')!;
  const field = resolveAtsOptimizationField(content, issue);
  const updated = applyContentQualitySuggestion(
    content,
    { ...issue, fieldId: field.fieldId, evidence: field.content } as any,
    '五年后端开发经验，专注高并发服务与性能优化。'
  );
  const after = analyzeResumeForAts(updated);
  assert.ok(after.score > before.score);
  assert.equal(
    after.issues.some((item) => item.id === issue.id),
    false
  );
});
test('兼容旧简历 bio 字段的 summary 回写', () => {
  const content = {
    basicInfo: { name: '张三', email: 'a@example.com', bio: 'testtest' },
  };
  const issue = analyzeResumeForAts(content).issues.find(
    (item) => item.field === 'summary'
  )!;
  const field = resolveAtsOptimizationField(content, issue);
  const updated = applyContentQualitySuggestion(
    content,
    { ...issue, fieldId: field.fieldId, evidence: field.content } as any,
    '真实个人概述内容'
  );
  assert.equal(updated.basicInfo.bio, '真实个人概述内容');
});
test('ATS 问题 ID 不受其他问题数量变化影响', () => {
  const first = analyzeResumeForAts({
    basicInfo: { name: '', email: '', summary: 'testtest' },
  }).issues.find((item) => item.field === 'summary')!;
  const second = analyzeResumeForAts({
    basicInfo: { name: '张三', email: 'a@example.com', summary: 'testtest' },
  }).issues.find((item) => item.field === 'summary')!;
  assert.equal(first.id, second.id);
});
