import assert from 'node:assert/strict';
import test from 'node:test';
import { createGuestAtsResult, createGuestInterviewReport, createGuestMatchResult, createGuestQualityResult, guestInterviewQuestions, guestSampleJob, guestSampleProfile, guestSampleResume } from './guest-samples';

test('游客示例资产形成可用的简历与岗位关系', () => {
  assert.equal(guestSampleJob.latestProfile?.jobDescriptionId, guestSampleJob.id);
  assert.equal(guestSampleProfile.status, 'confirmed');
  assert.ok(guestSampleResume.content.projects.length > 0);
});

test('游客本地分析返回完整且互相独立的结果', () => {
  const ats = createGuestAtsResult(guestSampleResume, guestSampleJob.id);
  const quality = createGuestQualityResult(guestSampleResume);
  const match = createGuestMatchResult(guestSampleResume, guestSampleJob, guestSampleProfile);
  assert.equal(ats.maxScore, 100);
  assert.ok(quality.dimensions.length === 5);
  assert.equal(match.jobProfileId, guestSampleProfile.id);
  assert.notEqual(ats.score, match.score);
});

test('游客面试报告根据回答完整度生成并保留逐题评价', () => {
  const answers = guestInterviewQuestions.map((question, index) => ({ questionId: question.id, submissionId: `answer-${index}`, content: '我会先说明背景和目标，再描述采取的行动、排查顺序以及最终结果，并复盘可以改进的地方。' }));
  const complete = createGuestInterviewReport('complete', guestSampleResume.id, guestSampleProfile.jobTitle, guestInterviewQuestions, answers);
  const partial = createGuestInterviewReport('partial', guestSampleResume.id, guestSampleProfile.jobTitle, guestInterviewQuestions, answers.slice(0, 1));
  assert.equal(complete.status, 'completed');
  assert.equal(complete.report?.questionEvaluations.length, guestInterviewQuestions.length);
  assert.ok(complete.score > partial.score);
});
