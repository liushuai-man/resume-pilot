import assert from 'node:assert/strict';
import test from 'node:test';
import { parseJobProfileOutput } from './job-profile.service';

const rawText = `
招聘 Java 后端工程师
负责订单系统的设计、开发和性能优化。
要求熟悉 Java、Spring Boot 和 PostgreSQL。
有微服务架构经验者优先。
`;

const validOutput = JSON.stringify({
  jobTitle: 'Java 后端工程师',
  seniority: '',
  industry: '',
  responsibilities: [
    {
      name: '订单系统研发',
      evidence: '负责订单系统的设计、开发和性能优化。',
      confidence: 0.95,
    },
  ],
  requiredSkills: [
    {
      name: 'Java 后端技术栈',
      evidence: '要求熟悉 Java、Spring Boot 和 PostgreSQL。',
      confidence: 0.98,
    },
  ],
  preferredSkills: [
    {
      name: '微服务经验',
      evidence: '有微服务架构经验者优先。',
      confidence: 0.97,
    },
  ],
  keywords: ['Java', 'Spring Boot', 'Java'],
  confidence: 0.94,
});

test('解析结构化岗位画像并去除重复关键词', () => {
  const result = parseJobProfileOutput(validOutput, rawText);
  assert.equal(result.jobTitle, 'Java 后端工程师');
  assert.deepEqual(result.keywords, ['Java', 'Spring Boot']);
});

test('接受 Markdown JSON 代码块和原文中的空白差异', () => {
  const output = validOutput.replace(
    '要求熟悉 Java、Spring Boot 和 PostgreSQL。',
    '要求熟悉Java、Spring Boot和PostgreSQL。'
  );
  assert.doesNotThrow(() =>
    parseJobProfileOutput(`\`\`\`json\n${output}\n\`\`\``, rawText)
  );
});

test('拒绝无法在 JD 原文定位的证据', () => {
  const output = validOutput.replace(
    '有微服务架构经验者优先。',
    '有大型互联网项目经验者优先。'
  );
  assert.throws(
    () => parseJobProfileOutput(output, rawText),
    /证据无法在 JD 原文中定位/
  );
});

test('拒绝不符合约定的模型输出', () => {
  assert.throws(() => parseJobProfileOutput('{"jobTitle":"Java"}', rawText));
});
