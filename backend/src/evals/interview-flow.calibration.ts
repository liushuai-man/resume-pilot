import 'dotenv/config';
import { prisma } from '../database/prisma';
import {
  createInitialInterviewState,
  runAnswerGraph,
  runNextQuestionGraph,
  runReportGraph,
} from '../ai/graphs/interview.graph';
import type { Evaluation } from '../ai/types/interview.types';

const syntheticResume = {
  basicInfo: { name: '校准候选人', title: 'Java 后端工程师' },
  experience: [{
    id: 'e1',
    position: '后端工程师',
    description: ['负责订单服务开发，使用 Redis 缓存热点数据，将接口 P95 延迟从 420ms 降至 180ms。'],
  }],
  skills: ['Java', 'Spring Boot', 'Redis', 'PostgreSQL'],
};

const answers = [
  '我有五年 Java 后端经验，主要负责订单系统和接口性能优化。',
  '项目中使用 Redis 缓存热点订单数据，并通过监控对比确认 P95 延迟从 420ms 降至 180ms。',
  '我会先确认缓存命中率和热点分布，再检查数据库慢查询，最后通过灰度发布验证优化效果。',
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { model_configs: { some: { is_default: true, is_deleted: false, purpose: 'chat' } } },
    select: { id: true },
  });
  if (!user) throw new Error('没有配置默认聊天模型的用户');

  const initial = createInitialInterviewState(
    'synthetic-resume', syntheticResume, '中级 Java 后端工程师', 3, user.id,
    {
      resumeSnapshot: {
        title: '模拟面试校准简历',
        content: syntheticResume,
        updatedAt: '2026-08-14T00:00:00.000Z',
      },
      jobProfileSnapshot: null,
      rubricSnapshot: {
        version: 'interview-rubric-v2-calibration',
        mode: 'general',
        dimensions: [
          { key: 'technical', label: '技术能力', weight: 0.4 },
          { key: 'communication', label: '表达能力', weight: 0.3 },
          { key: 'project', label: '项目深度', weight: 0.3 },
        ],
      },
      interviewPlan: [
        { dimensionKey: 'technical', dimensionLabel: '技术能力', topic: '缓存与性能', priority: 1, count: 1, askedCount: 0 },
        { dimensionKey: 'project', dimensionLabel: '项目深度', topic: '订单系统', priority: 2, count: 1, askedCount: 0 },
      ],
    },
  );

  let state = initial.session;
  const startedAt = Date.now();
  for (let index = 0; index < answers.length; index += 1) {
    const answered = await runAnswerGraph(state, answers[index], `calibration-${index + 1}`);
    state = answered.session;
    if (!state.isFinished) {
      const generated = await runNextQuestionGraph(state);
      state = generated.session;
    }
  }
  const reportResult = await runReportGraph(state);
  const report = reportResult.report;
  const evaluations = reportResult.session.evaluations;

  if (state.questions.length !== 3 || state.answers.length !== 3) {
    throw new Error('INTERVIEW_FLOW_COUNT_MISMATCH');
  }
  if (
    evaluations.length !== 3
    || evaluations.some((item: Evaluation) => !state.questions.some((question) => question.id === item.questionId))
  ) {
    throw new Error('INTERVIEW_EVALUATION_COVERAGE_INVALID');
  }
  if (!Number.isFinite(report?.overallScore) || report.overallScore < 0 || report.overallScore > 100) {
    throw new Error('INTERVIEW_REPORT_SCORE_INVALID');
  }

  console.log(JSON.stringify({
    passed: true,
    questions: state.questions.map((question) => ({
      id: question.id,
      type: question.type,
      dimensionKeys: question.dimensionKeys,
    })),
    evaluationCount: evaluations.length,
    overallScore: report.overallScore,
    reportVersion: report.reportVersion,
    durationMs: Date.now() - startedAt,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
