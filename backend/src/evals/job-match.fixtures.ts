const profile = {
  job_title: '高级 Java 后端工程师', seniority: '5 年以上', industry: '互联网',
  responsibilities: [{ name: '建设高并发交易系统', evidence: '负责高并发交易系统设计与建设', confidence: .95 }],
  required_skills: [{ name: 'Java 与 Spring Boot', evidence: '精通 Java、Spring Boot', confidence: .95 }, { name: 'Redis', evidence: '熟悉 Redis', confidence: .9 }],
  preferred_skills: [{ name: 'Kafka', evidence: '有 Kafka 实战经验优先', confidence: .9 }], keywords: ['Java', 'Spring Boot', 'Redis', 'Kafka'],
};
const resume = (summary: string, description: string, skills: string) => ({ blocks: [{ type: 'basic', data: { summary } }, { type: 'experience', data: [{ id: 'e1', position: '后端工程师', description: [description] }] }, { type: 'skills', data: [{ id: 's1', name: skills }] }] });
export const jobMatchFixtures = [
  { id: 'strong-match', profile, content: resume('6 年 Java 后端经验。', '使用 Spring Boot、Redis 与 Kafka 建设交易链路，将 P95 延迟降低 40%。', 'Java、Spring Boot、Redis、Kafka'), score: [75, 100], expected: ['matched'] },
  { id: 'keyword-without-evidence', profile, content: resume('Java 后端开发。', '参与系统相关工作，完成各项开发任务。', 'Java、Spring Boot、Redis、Kafka'), score: [10, 60], expected: ['insufficient_evidence'] },
  { id: 'skill-gap', profile, content: resume('3 年 Python 数据开发经验。', '使用 Python 开发离线数据清洗任务。', 'Python、Pandas、SQL'), score: [0, 40], expected: ['gap'] },
  { id: 'seniority-mismatch', profile, content: resume('1 年 Java 开发经验。', '使用 Spring Boot 维护内部管理接口。', 'Java、Spring Boot'), score: [15, 60], expected: ['gap', 'insufficient_evidence'] },
];
