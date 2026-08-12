import assert from 'node:assert/strict';
import test from 'node:test';
import { optimizationActionData } from './optimization-action.service';
test('构造可信的采纳记录', () => { const data = optimizationActionData({ userId: 'u', resumeId: 'r', versionId: 'v', source: 'ats', targetId: 'i', fieldId: 'basic:root:summary', originalText: '旧', finalText: '新', scoreBefore: 20, scoreAfter: 25, resolved: true }); assert.equal(data.status, 'accepted'); assert.equal(data.score_after, 25); });
