import assert from 'node:assert/strict';
import test from 'node:test';
import { generateJobMatchOptimization, parseJobMatchOptimizationOutput } from './job-match-optimization.service';

test('没有候选人事实时先追问', async () => { const result = await generateJobMatchOptimization('unused', { resumeEvidence: '熟悉 Redis' }); assert.equal(result.mode, 'needs_input'); });
test('JD 中的数字不能被当作候选人事实', () => { assert.throws(() => parseJobMatchOptimizationOutput(JSON.stringify({ suggestedText: '将延迟降低 50%', reason: '匹配岗位', usedUserFacts: [] }), '熟悉 Redis', ''), /未经提供的数字/); });
