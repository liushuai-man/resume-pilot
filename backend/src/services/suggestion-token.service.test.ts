import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSuggestionToken,
  verifySuggestionToken,
} from './suggestion-token.service';
process.env.JWT_SECRET ||= 'test-secret';
test('签发并验证绑定建议内容和依据的 token', () => {
  const token = createSuggestionToken({
    userId: '00000000-0000-4000-8000-000000000001',
    resumeId: '00000000-0000-4000-8000-000000000002',
    source: 'content_quality',
    targetId: 'a:0',
    fieldId: 'basic:root:summary',
    originalText: '旧',
    suggestedText: '新',
    reason: '表达空泛',
    evidence: '旧',
  });
  const value = verifySuggestionToken(token);
  assert.equal(value.suggestedText, '新');
  assert.equal(value.reason, '表达空泛');
});
test('拒绝篡改 token', () => {
  const token = createSuggestionToken({
    userId: '00000000-0000-4000-8000-000000000001',
    resumeId: '00000000-0000-4000-8000-000000000002',
    source: 'ats',
    targetId: 'i',
    fieldId: 'skills:s1:name',
    originalText: '旧',
    suggestedText: '新',
  });
  assert.throws(() => verifySuggestionToken(`${token}x`));
});

test('兼容不含原因与依据的旧 token', () => {
  const token = createSuggestionToken({
    userId: '00000000-0000-4000-8000-000000000001',
    resumeId: '00000000-0000-4000-8000-000000000002',
    source: 'ats',
    targetId: 'i',
    fieldId: 'skills:s1:name',
    originalText: '旧',
    suggestedText: '新',
  });
  assert.equal(verifySuggestionToken(token).reason, undefined);
});
