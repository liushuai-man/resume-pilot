import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertRetryRequest,
  evaluationInputHash,
} from './interview-retry-policy';

const state = {
  resumeSnapshot: {
    title: '简历',
    content: { skills: ['TypeScript'] },
    updatedAt: '2026-08-13',
  },
  jobProfileSnapshot: null,
  rubricSnapshot: { version: 'v2', mode: 'general', dimensions: [] },
  questions: [{ id: 'q1', content: '问题', dimensionKeys: [] }],
  answers: [
    { questionId: 'q1', content: '回答', submissionId: 'submission-1' },
  ],
} as any;

test('评价输入哈希对相同冻结事实保持稳定', () => {
  assert.equal(
    evaluationInputHash(state),
    evaluationInputHash(structuredClone(state))
  );
});

test('回答、问题或冻结快照变化会使旧 checkpoint 失效', () => {
  const original = evaluationInputHash(state);
  const changed = structuredClone(state);
  changed.answers[0].content = '修改后的回答';
  assert.notEqual(evaluationInputHash(changed), original);
});

test('只允许重试当前失败节点且输入哈希必须一致', () => {
  const hash = evaluationInputHash(state);
  assert.doesNotThrow(() =>
    assertRetryRequest({
      nodeKey: 'batch_evaluation',
      expectedInputHash: hash,
      currentInputHash: hash,
      storedInputHash: hash,
      status: 'failed',
      failedNode: 'batch_evaluation',
    })
  );
  assert.throws(
    () =>
      assertRetryRequest({
        nodeKey: 'question_generation',
        expectedInputHash: hash,
        currentInputHash: hash,
        storedInputHash: hash,
        status: 'failed',
        failedNode: 'question_generation',
      }),
    /INTERVIEW_NODE_NOT_RETRYABLE/
  );
  assert.throws(
    () =>
      assertRetryRequest({
        nodeKey: 'batch_evaluation',
        expectedInputHash: hash,
        currentInputHash: hash,
        storedInputHash: hash,
        status: 'failed',
        failedNode: 'report_composition',
      }),
    /INTERVIEW_NODE_STATE_CONFLICT/
  );
});

test('并发执行和过期输入被明确拒绝', () => {
  const hash = evaluationInputHash(state);
  assert.throws(
    () =>
      assertRetryRequest({
        nodeKey: 'batch_evaluation',
        expectedInputHash: hash,
        currentInputHash: hash,
        storedInputHash: hash,
        status: 'generating',
        failedNode: 'batch_evaluation',
      }),
    /INTERVIEW_NODE_ALREADY_RUNNING/
  );
  assert.throws(
    () =>
      assertRetryRequest({
        nodeKey: 'batch_evaluation',
        expectedInputHash: 'old',
        currentInputHash: hash,
        storedInputHash: hash,
        status: 'failed',
        failedNode: 'batch_evaluation',
      }),
    /INTERVIEW_CHECKPOINT_STALE/
  );
});
