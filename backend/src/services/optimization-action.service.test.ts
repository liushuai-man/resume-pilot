import assert from 'node:assert/strict';
import test from 'node:test';
import {
  issueFromOptimizationAction,
  optimizationActionData,
  optimizationActionDataView,
} from './optimization-action.service';
test('构造可信的采纳记录', () => {
  const data = optimizationActionData({
    userId: 'u',
    resumeId: 'r',
    versionId: 'v',
    source: 'ats',
    targetId: 'i',
    fieldId: 'basic:root:summary',
    originalText: '旧',
    finalText: '新',
    scoreBefore: 20,
    scoreAfter: 25,
    resolved: true,
  });
  assert.equal(data.status, 'accepted');
  assert.equal(data.score_after, 25);
});

test('优化历史视图不暴露内部版本 ID', () => {
  const view = optimizationActionDataView({
    id: 'a',
    resume_id: 'r',
    version_id: 'v',
    source: 'ats',
    target_id: 'i',
    field_id: 'basic:root:summary',
    original_text: '旧',
    final_text: '新',
    status: 'accepted',
    score_before: 20,
    score_after: 25,
    resolved: true,
    created_at: new Date(0),
    updated_at: new Date(0),
  });
  assert.equal(view.canRevert, true);
  assert.equal(view.actionType, 'suggestion');
  assert.equal('versionId' in view, false);
});

test('撤销事件不可再次撤销并保留父记录', () => {
  const view = optimizationActionDataView({
    id: 'undo',
    resume_id: 'r',
    version_id: 'v2',
    source: 'ats',
    action_type: 'revert',
    parent_action_id: 'a',
    target_id: 'i',
    field_id: 'basic:root:summary',
    original_text: '新',
    final_text: '旧',
    status: 'accepted',
    created_at: new Date(0),
    updated_at: new Date(0),
  });
  assert.equal(view.canRevert, false);
  assert.equal(view.parentActionId, 'a');
});

test('从优化记录恢复字段定位', () => {
  assert.deepEqual(
    issueFromOptimizationAction({
      field_id: 'experience:e1:description',
      final_text: '新文本',
    }),
    {
      section: 'experience',
      itemId: 'e1',
      field: 'description',
      fieldId: 'experience:e1:description',
      evidence: '新文本',
    }
  );
  assert.equal(
    issueFromOptimizationAction({
      field_id: 'basic:root:summary',
      final_text: '简介',
    }).itemId,
    undefined
  );
  assert.throws(
    () => issueFromOptimizationAction({ field_id: 'invalid', final_text: 'x' }),
    /字段定位无效/
  );
});
