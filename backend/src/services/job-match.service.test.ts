import assert from 'node:assert/strict';
import test from 'node:test';
import { extractResumeQualityFields } from './content-quality.service';
import { buildMatchRequirements, parseJobMatchOutput } from './job-match.service';

const profile = { responsibilities: [{ name: '建设交易系统', evidence: '负责交易系统建设' }], required_skills: [{ name: 'Java', evidence: '熟悉 Java' }], preferred_skills: [] };
const requirements = buildMatchRequirements(profile);
const fields = extractResumeQualityFields({ blocks: [{ type: 'experience', data: [{ id: 'e1', position: '后端工程师', description: ['使用 Java 建设交易系统，将延迟降低 30%。'] }] }] });
const output = JSON.stringify({
  dimensions: [
    { key: 'skillCoverage', score: 30, confidence: .9, reason: '技能有证据' },
    { key: 'responsibilityRelevance', score: 25, confidence: .9, reason: '职责相关' },
    { key: 'keywordEvidence', score: 15, confidence: .8, reason: '关键词可定位' },
    { key: 'seniorityFit', score: 5, confidence: .5, reason: '年限信息不足' },
  ],
  requirements: [
    { requirementId: 'responsibility:0', status: 'matched', resumeFieldId: 'experience:e1:description', resumeEvidence: '建设交易系统', reason: '职责直接相关', confidence: .9 },
    { requirementId: 'required_skill:0', status: 'matched', resumeFieldId: 'experience:e1:description', resumeEvidence: 'Java', reason: '有使用场景', confidence: .9 },
  ], overallConfidence: .8,
});

test('返回四维独立得分并定位简历证据', () => {
  const result = parseJobMatchOutput(output, requirements, fields);
  assert.equal(result.score, 75);
  assert.equal(result.requirements[0].section, 'experience');
  assert.equal(result.requirements[0].requirementName, '建设交易系统');
  assert.equal(result.requirements[0].jdEvidence, '负责交易系统建设');
  assert.equal(result.requirements[0].category, 'responsibility');
});

test('拒绝编造的简历证据', () => {
  const invalid = JSON.parse(output); invalid.requirements[0].resumeEvidence = '不存在的证据';
  assert.throws(() => parseJobMatchOutput(JSON.stringify(invalid), requirements, fields), /证据无法定位/);
});

test('低置信度结论由后端强制归一化为待确认', () => {
  const invalid = JSON.parse(output); invalid.requirements[0].confidence = .4;
  const result = parseJobMatchOutput(JSON.stringify(invalid), requirements, fields);
  assert.equal(result.requirements[0].status, 'needs_confirmation');
  assert.equal(result.requirements[0].resumeEvidence, null);
});

test('岗位要求必须逐项且不重复评价', () => {
  const invalid = JSON.parse(output); invalid.requirements.pop();
  assert.throws(() => parseJobMatchOutput(JSON.stringify(invalid), requirements, fields), /评价不完整/);
});
