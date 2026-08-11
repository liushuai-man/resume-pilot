import assert from 'node:assert/strict';
import test from 'node:test';
import { extractResumeQualityFields, parseContentQualityOutput } from './content-quality.service';

const fields = extractResumeQualityFields({
  blocks: [
    { type: 'basic', data: { summary: '五年后端开发经验，负责交易系统建设。' } },
    { type: 'skills', data: [{ id: 's1', name: '熟悉 Java 和 Spring Boot' }] },
  ],
});

const validOutput = JSON.stringify({
  dimensions: [
    { key: 'coherence', score: 20, confidence: 0.9, reason: '整体连贯' },
    { key: 'informationValue', score: 18, confidence: 0.8, reason: '包含方向信息' },
    { key: 'evidenceSpecificity', score: 10, confidence: 0.8, reason: '结果证据不足' },
    { key: 'consistency', score: 12, confidence: 0.6, reason: '字段较少' },
    { key: 'professionalism', score: 8, confidence: 0.9, reason: '表达专业' },
  ],
  issues: [{ fieldId: 'skills:s1:name', evidence: '熟悉 Java', dimension: 'evidenceSpecificity', severity: 'warning', reason: '只有技能名称', suggestion: '补充真实使用场景', confidence: 0.65 }],
  overallConfidence: 0.8,
});

test('提取稳定字段定位并计算五维总分', () => {
  assert.ok(fields.some((field) => field.fieldId === 'basic:root:summary'));
  const result = parseContentQualityOutput(validOutput, fields);
  assert.equal(result.score, 68);
  assert.equal(result.dimensions.length, 5);
  assert.equal(result.issues[0].status, 'needs_confirmation');
});

test('拒绝无法定位到字段原文的模型证据', () => {
  const invalid = JSON.parse(validOutput);
  invalid.issues[0].evidence = '模型编造的内容';
  assert.throws(() => parseContentQualityOutput(JSON.stringify(invalid), fields), /证据无法/);
});

test('拒绝重复或缺失的评价维度', () => {
  const invalid = JSON.parse(validOutput);
  invalid.dimensions[4].key = 'coherence';
  assert.throws(() => parseContentQualityOutput(JSON.stringify(invalid), fields), /维度不完整或重复/);
});
