import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeResumeForAts } from './ats-analysis.service';

test('证据充分的完整简历通过确定性规则获得满分', () => {
  const result = analyzeResumeForAts({
    blocks: [
      {
        type: 'basic',
        data: {
          name: '张三',
          email: 'a@example.com',
          summary:
            '五年后端开发经验，负责过高并发交易系统、服务治理和研发效能建设，具备从需求分析到生产交付的完整经验。',
        },
      },
      {
        type: 'education',
        data: [
          {
            school: '大学',
            major: '计算机科学',
            degree: '本科',
            startDate: '2018-09',
            endDate: '2022-06',
            description:
              '主修数据结构、操作系统、计算机网络和数据库原理，完成分布式系统课程设计。',
          },
        ],
      },
      {
        type: 'experience',
        data: [
          {
            id: 'e1',
            company: '公司',
            position: '工程师',
            startDate: '2022-01',
            endDate: '至今',
            description: [
              '负责核心交易服务重构，拆分订单、支付与库存领域边界，完善灰度发布和回滚流程。',
              '通过缓存分层、异步消息和慢查询治理将接口耗时降低 30%，稳定支持 10 个业务系统。',
              '建设监控告警与故障复盘机制，推动团队形成容量评估、压测和上线检查清单。',
            ],
          },
        ],
      },
      {
        type: 'projects',
        data: [
          {
            id: 'p1',
            name: '交易平台',
            role: '核心开发',
            startDate: '2023-01',
            endDate: '2023-08',
            description: [
              '设计订单状态机和幂等控制方案，完成异常补偿、对账任务与链路追踪能力建设，并建立关键交易场景的自动化回归用例，降低重复处理风险和人工核对成本。',
            ],
          },
          {
            id: 'p2',
            name: '研发效能平台',
            role: '项目负责人',
            startDate: '2023-09',
            endDate: '2024-04',
            description: [
              '整合代码检查、自动化测试和发布审批流程，设计统一流水线模板、质量门禁与失败通知机制，推动多个团队统一交付规范并缩短问题定位时间。',
            ],
          },
        ],
      },
      {
        type: 'skills',
        data: [
          '熟悉 Java、Spring Boot 和关系型数据库，能够完成服务设计、性能排查与生产问题处理',
          '熟悉 Docker、Kubernetes 与持续集成流程，具备容器化部署和可观测性建设经验',
          '熟悉缓存、消息队列和分布式事务常见方案，能够结合业务约束完成技术选型与故障治理',
        ],
      },
    ],
  });
  assert.equal(result.score, 100);
  assert.equal(result.issues.length, 0);
});

test('模块齐全但内容稀疏时分数被限制在较低区间', () => {
  const result = analyzeResumeForAts({
    blocks: [
      {
        type: 'basic',
        data: { name: '张三', email: 'a@example.com', summary: '后端开发。' },
      },
      { type: 'education', data: [{ school: '大学' }] },
      {
        type: 'experience',
        data: [
          {
            id: 'e1',
            company: '公司',
            position: '工程师',
            startDate: '2024-01',
            endDate: '至今',
            description: '负责开发。',
          },
        ],
      },
      { type: 'skills', data: ['Java'] },
    ],
  });
  assert.ok(result.score < 50);
  assert.ok(result.issues.some((issue) => issue.field === 'contentDensity'));
});

test('问题包含可跳转的字段定位与明确扣分', () => {
  const result = analyzeResumeForAts({
    blocks: [{ type: 'basic', data: { name: '' } }],
  });
  assert.ok(result.score < 100);
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.section === 'basic' &&
        issue.field === 'name' &&
        issue.availablePoints > 0
    )
  );
  assert.ok(result.summary.errors > 0);
});

test('无法解析的内容返回可解析性错误', () => {
  const result = analyzeResumeForAts('not-json');
  assert.ok(result.issues.some((issue) => issue.category === 'parseability'));
});

test('明显乱码和占位文本不得分并产生严重提示', () => {
  const result = analyzeResumeForAts({
    blocks: [
      { type: 'basic', data: { name: '张三', email: 'a@example.com' } },
      {
        type: 'education',
        data: [
          {
            id: 'edu-1',
            school: '测试测试测试测试',
            major: 'asdfasdfasdf',
            degree: '本科',
            startDate: '2020',
            endDate: '2024',
          },
        ],
      },
      { type: 'skills', data: [{ id: 'skill-1', name: '哈哈哈哈哈哈哈哈' }] },
      { type: 'objective', data: { objective: '随便写随便写随便写' } },
    ],
  });
  assert.ok(
    result.issues.filter((issue) => issue.severity === 'error').length >= 3
  );
  assert.ok(result.issues.some((issue) => issue.section === 'education'));
  assert.ok(result.issues.some((issue) => issue.section === 'skills'));
  assert.ok(result.issues.some((issue) => issue.section === 'objective'));
  assert.ok(result.limitations.some((item) => item.includes('真实性')));
});
