import assert from 'node:assert/strict';
import test from 'node:test';
import { applyContentQualitySuggestion } from './resume-version.service';

const issue: any = { section: 'experience', itemId: 'e1', field: 'description', evidence: '负责接口优化。' };
const content = { experience: [{ id: 'e1', description: '负责接口优化。' }], _documentSections: [{ type: 'experience', data: [{ id: 'e1', description: '负责接口优化。' }] }] };

test('同时更新标准内容和编辑器骨架且不修改原对象', () => {
  const updated = applyContentQualitySuggestion(content, issue, '通过缓存优化接口。');
  assert.equal(updated.experience[0].description, '通过缓存优化接口。');
  assert.equal(updated._documentSections[0].data[0].description, '通过缓存优化接口。');
  assert.equal(content.experience[0].description, '负责接口优化。');
});

test('字段已变化时拒绝覆盖', () => {
  assert.throws(() => applyContentQualitySuggestion({ ...content, experience: [{ id: 'e1', description: '用户已修改' }] }, issue, '新文本'), /字段已变化/);
});
