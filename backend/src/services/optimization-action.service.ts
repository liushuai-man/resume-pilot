export const optimizationActionData = (input: { userId: string; resumeId: string; versionId: string; source: string; targetId: string; fieldId: string; originalText: string; finalText: string; scoreBefore?: number; scoreAfter?: number; resolved?: boolean }) => ({
  user_id: input.userId, resume_id: input.resumeId, version_id: input.versionId, source: input.source, target_id: input.targetId, field_id: input.fieldId, original_text: input.originalText, final_text: input.finalText, status: 'accepted', score_before: input.scoreBefore, score_after: input.scoreAfter, resolved: input.resolved,
});
