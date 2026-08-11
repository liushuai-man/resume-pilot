import 'dotenv/config';
import { prisma } from '../database/prisma';
import { evaluateJobMatch } from '../services/job-match.service';
import { jobMatchFixtures } from './job-match.fixtures';

const fixtureId = process.argv.find((v) => v.startsWith('--fixture='))?.split('=')[1];
const timeoutMs = Number(process.argv.find((v) => v.startsWith('--timeout-ms='))?.split('=')[1] || 120000);
async function main() {
  const user = await prisma.user.findFirst({ where: { model_configs: { some: { is_default: true, is_deleted: false, purpose: 'chat' } } }, select: { id: true } });
  if (!user) throw new Error('没有配置默认聊天模型的用户');
  const fixtures = fixtureId ? jobMatchFixtures.filter((v) => v.id === fixtureId) : jobMatchFixtures;
  if (!fixtures.length) throw new Error('未知岗位匹配样本');
  let failed = 0;
  for (const fixture of fixtures) {
    console.error(`[job-match calibration] start ${fixture.id}`);
    const startedAt = Date.now();
    const result = await evaluateJobMatch(user.id, fixture.profile, fixture.content, { maxRetries: 0, timeout: timeoutMs });
    const statuses = [...new Set(result.requirements.map((v) => v.status))];
    const passed = result.score >= fixture.score[0] && result.score <= fixture.score[1] && fixture.expected.some((v) => statuses.includes(v as any));
    if (!passed) failed++;
    console.log(JSON.stringify({ fixture: fixture.id, passed, score: result.score, expectedScore: fixture.score, statuses, modelName: result.modelName, durationMs: Date.now() - startedAt }));
  }
  if (failed) throw new Error(`${failed} 个岗位匹配校准样本未通过`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
