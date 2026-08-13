import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBatchEvaluations } from './evaluation.agent';

const evaluation = (questionId: string, score = 7) => ({
  questionId, score, feedback: '反馈', strengths: ['优点'], weaknesses: ['不足'],
  knowledgeGap: [], followUpSuggestion: '', profileUpdate: null,
});

test('批量评价必须完整覆盖输入问题并保持顺序可用', () => {
  const result = validateBatchEvaluations([evaluation('q1'), evaluation('q2', 8)], ['q1', 'q2']);
  assert.deepEqual(result.map((item) => item.questionId), ['q1', 'q2']);
});

test('批量评价拒绝缺失、重复和未知 questionId', () => {
  assert.throws(() => validateBatchEvaluations([evaluation('q1')], ['q1', 'q2']), /INCOMPLETE/);
  assert.throws(() => validateBatchEvaluations([evaluation('q1'), evaluation('q1')], ['q1']), /MISMATCH/);
  assert.throws(() => validateBatchEvaluations([evaluation('q3')], ['q1']), /MISMATCH/);
});

test('批量评价拒绝越界或非整数分数', () => {
  assert.throws(() => validateBatchEvaluations([evaluation('q1', 11)], ['q1']), /SCORE_INVALID/);
  assert.throws(() => validateBatchEvaluations([evaluation('q1', 7.5)], ['q1']), /SCORE_INVALID/);
});
