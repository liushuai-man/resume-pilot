import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldFinishInterview } from './completion-policy';

function state(answerCount: number, overrides: Record<string, unknown> = {}) {
  return {
    answers: Array.from({ length: answerCount }, (_, index) => ({ questionId: `q${index}`, content: '这是一段包含背景、行动、结果和复盘的完整回答，用于证明候选人已经提供了足够的评估信息。' })),
    minQuestions: 5, maxQuestions: 10, questionCountMode: 'adaptive',
    rubricSnapshot: { dimensions: [{ key: 'technical' }, { key: 'communication' }] },
    coveredDimensions: { technical: 1, communication: 1 }, interviewPlan: [], ...overrides,
  } as any;
}

test('自适应模式在 5 题前不会结束', () => {
  assert.equal(shouldFinishInterview(state(4)), false);
});

test('自适应模式证据充足时可在 5–10 题内结束', () => {
  assert.equal(shouldFinishInterview(state(5)), true);
});

test('自适应模式 10 题强制结束，固定模式不提前结束', () => {
  assert.equal(shouldFinishInterview(state(10, { coveredDimensions: {} })), true);
  assert.equal(shouldFinishInterview(state(5, { questionCountMode: 'fixed', maxQuestions: 6, minQuestions: 6 })), false);
  assert.equal(shouldFinishInterview(state(6, { questionCountMode: 'fixed', maxQuestions: 6, minQuestions: 6 })), true);
});
