import test from 'node:test';
import assert from 'node:assert/strict';
import { contentToDocument } from './resume-migration';

test('旧简历 careerObjective 数组不会导致预览或打印迁移崩溃', () => {
  const document = contentToDocument({ basicInfo: {}, careerObjective: [] } as any, null, 'classic');
  assert.equal(document.sections.some((item) => item.type === 'objective'), false);
});

test('旧简历 careerObjective 对象数组会合并为可打印文本', () => {
  const document = contentToDocument({ basicInfo: {}, careerObjective: [{ content: '后端工程师' }, { description: '平台方向' }] } as any, null, 'classic');
  const objective = document.sections.find((item) => item.type === 'objective') as any;
  assert.equal(objective.data.content, '后端工程师\n平台方向');
});
