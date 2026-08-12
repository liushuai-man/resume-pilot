export const optimizationActionData = (input: { userId: string; resumeId: string; versionId: string; source: string; targetId: string; fieldId: string; originalText: string; finalText: string; reason?: string; evidence?: string; scoreBefore?: number; scoreAfter?: number; resolved?: boolean }) => ({
  user_id: input.userId, resume_id: input.resumeId, version_id: input.versionId, source: input.source, action_type: 'suggestion', target_id: input.targetId, field_id: input.fieldId, original_text: input.originalText, final_text: input.finalText, reason: input.reason, evidence: input.evidence, status: 'accepted', score_before: input.scoreBefore, score_after: input.scoreAfter, resolved: input.resolved,
});

export const optimizationActionDataView = (action: any) => ({
  id: action.id,
  resumeId: action.resume_id,
  source: action.source,
  actionType: action.action_type ?? 'suggestion',
  parentActionId: action.parent_action_id ?? null,
  targetId: action.target_id,
  fieldId: action.field_id,
  originalText: action.original_text,
  finalText: action.final_text,
  reason: action.reason ?? null,
  evidence: action.evidence ?? null,
  status: action.status,
  scoreBefore: action.score_before,
  scoreAfter: action.score_after,
  resolved: action.resolved,
  canRevert: (action.action_type ?? 'suggestion') === 'suggestion' && action.status === 'accepted' && Boolean(action.version_id),
  createdAt: action.created_at,
  updatedAt: action.updated_at,
});

export function issueFromOptimizationAction(action: { field_id: string; final_text: string }) {
  const parts = action.field_id.split(':');
  if (parts.length < 3) throw new Error('优化记录的字段定位无效');
  const [section, itemId, ...fieldParts] = parts;
  const field = fieldParts.join(':');
  return {
    section,
    itemId: itemId === 'root' ? undefined : itemId,
    field,
    fieldId: action.field_id,
    evidence: action.final_text,
  };
}
