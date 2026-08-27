import assert from 'node:assert/strict';
import test from 'node:test';
import {
  generateResumeOptimization,
  parseOptimizationOutput,
} from './resume-optimization.service';

const issue: any = {
  fieldId: 'experience:e1:description',
  section: 'experience',
  itemId: 'e1',
  field: 'description',
  evidence: '负责接口优化。',
  dimension: 'evidenceSpecificity',
  severity: 'warning',
  reason: '缺少行动和结果',
  suggestion: '补充事实',
  confidence: 0.9,
  status: 'confirmed',
};
test('缺少事实时转为追问而不是编造建议', async () => {
  const result = await generateResumeOptimization('unused', issue);
  assert.equal(result.mode, 'needs_input');
  assert.equal(result.questions.length, 3);
});
test('接受只使用原文和用户事实的建议', () => {
  const result = parseOptimizationOutput(
    JSON.stringify({
      suggestedText: '优化接口，将延迟降低 20%。',
      reason: '补充结果',
      usedUserFacts: ['延迟降低 20%'],
    }),
    issue,
    '通过缓存优化，延迟降低 20%'
  );
  assert.equal(result.mode, 'suggestion');
});
test('拒绝凭空引入量化结果', () => {
  assert.throws(
    () =>
      parseOptimizationOutput(
        JSON.stringify({
          suggestedText: '将延迟降低 50%。',
          reason: '补充结果',
          usedUserFacts: [],
        }),
        issue,
        ''
      ),
    /未经提供的数字/
  );
});
