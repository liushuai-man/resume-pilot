export interface ContentQualityFixture {
  id: string;
  description: string;
  content: unknown;
  expectedScore: { min: number; max: number };
  expectedIssueDimensions: string[];
}

const basic = (summary: string) => ({ type: 'basic', data: { summary } });

export const contentQualityFixtures: ContentQualityFixture[] = [
  {
    id: 'strong-complete',
    description: '完整、具体且语言专业的后端工程师简历',
    expectedScore: { min: 75, max: 100 },
    expectedIssueDimensions: [],
    content: { blocks: [
      basic('5 年后端开发经验，聚焦高并发交易系统与服务稳定性建设。'),
      { type: 'experience', data: [{ id: 'exp-1', position: '高级后端工程师', description: ['负责订单服务拆分，使用 Java、Spring Boot 与 Redis 重构核心链路。', '通过压测和慢查询治理将接口 P95 延迟从 420ms 降至 180ms，并建立告警与回滚机制。'] }] },
      { type: 'skills', data: [{ id: 'skill-1', name: 'Java、Spring Boot、PostgreSQL、Redis、Kafka' }] },
    ] },
  },
  {
    id: 'semantic-filler',
    description: '字段齐全但只有空泛自评和无效填充',
    expectedScore: { min: 0, max: 45 },
    expectedIssueDimensions: ['informationValue', 'evidenceSpecificity'],
    content: { blocks: [
      basic('本人能力很强，工作认真负责，学习能力强，各方面都很优秀。'),
      { type: 'experience', data: [{ id: 'exp-1', position: '工程师', description: ['负责很多重要工作，完成领导安排的各种任务，取得了很好的成果。'] }] },
      { type: 'skills', data: [{ id: 'skill-1', name: '精通各种技术，熟悉所有常用工具' }] },
    ] },
  },
  {
    id: 'garbled-repeated',
    description: '重复字符、键盘乱码与破碎语句',
    expectedScore: { min: 0, max: 25 },
    expectedIssueDimensions: ['coherence', 'informationValue', 'professionalism'],
    content: { blocks: [
      basic('啊啊啊啊啊 qwerty asdf !!! 工作工作工作工作'),
      { type: 'experience', data: [{ id: 'exp-1', position: '开发', description: ['系统然后就是做了做了做了，。。。。xxx xxx xxx'] }] },
    ] },
  },
  {
    id: 'fictional-entity-neutrality',
    description: '实体虚构但语言正常，模型不得判断真伪',
    expectedScore: { min: 55, max: 100 },
    expectedIssueDimensions: [],
    content: { blocks: [
      basic('3 年数据平台研发经验，负责批流一体任务编排与数据质量治理。'),
      { type: 'education', data: [{ id: 'edu-1', school: '云海星辰大学', major: '计算机科学', description: '完成分布式系统与数据库课程项目。' }] },
      { type: 'experience', data: [{ id: 'exp-1', position: '数据工程师', description: ['在银河鲸科技负责数据管道开发，使用 Flink 处理实时事件。', '通过检查点调优将任务恢复时间缩短 35%。'] }] },
    ] },
  },
  {
    id: 'cross-field-contradiction',
    description: '职业年限和经历时间存在明显跨字段矛盾',
    expectedScore: { min: 20, max: 70 },
    expectedIssueDimensions: ['consistency'],
    content: { blocks: [
      basic('拥有 10 年全职后端研发经验，长期担任技术负责人。'),
      { type: 'education', data: [{ id: 'edu-1', school: '示例大学', major: '软件工程', description: '2024 年毕业后开始第一份全职工作。' }] },
      { type: 'experience', data: [{ id: 'exp-1', position: '初级后端工程师', description: ['2024 年 7 月加入团队，负责维护内部管理接口。'] }] },
    ] },
  },
];
