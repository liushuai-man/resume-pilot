import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInterviewReport } from './report-builder';

const questions: any[] = [
  { id: 'q1', dimensionKeys: ['technical'] },
  { id: 'q2', dimensionKeys: ['project'] },
];
const evaluations: any[] = [
  { questionId: 'q1', score: 8, strengths: ['准确'], weaknesses: [], knowledgeGap: [] },
  { questionId: 'q2', score: 6, strengths: [], weaknesses: ['证据不足'], knowledgeGap: ['量化结果'], followUpSuggestion: '补充项目结果' },
];
const rubric: any = { version: 'v1', mode: 'general', dimensions: [
  { key: 'technical', label: '技术', weight: 0.6 }, { key: 'project', label: '项目', weight: 0.4 },
] };

test('按冻结 Rubric 确定性聚合总分和维度分', () => {
  const report = buildInterviewReport(questions, [], evaluations, rubric, { skills: {}, overallLevel: 0 });
  assert.equal(report.overallScore, 72);
  assert.deepEqual(report.dimensionScores.map((item) => item.score), [80, 60]);
  assert.equal(report.reportVersion, 'interview-report-v2-deterministic');
});

test('没有覆盖的维度不稀释已评价维度', () => {
  const extended = { ...rubric, dimensions: [...rubric.dimensions, { key: 'communication', label: '表达', weight: 0.5 }] };
  const report = buildInterviewReport(questions, [], evaluations, extended, { skills: {}, overallLevel: 0 });
  assert.equal(report.overallScore, 72);
});
