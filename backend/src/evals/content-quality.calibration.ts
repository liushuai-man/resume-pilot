import 'dotenv/config';
import { prisma } from '../database/prisma';
import { evaluateResumeContent } from '../services/content-quality.service';
import { contentQualityFixtures } from './content-quality.fixtures';

const userIdArg = process.argv.find((arg) => arg.startsWith('--user-id='))?.slice('--user-id='.length);
const fixtureArg = process.argv.find((arg) => arg.startsWith('--fixture='))?.slice('--fixture='.length);
const timeoutArg = process.argv.find((arg) => arg.startsWith('--timeout-ms='))?.slice('--timeout-ms='.length);
const timeoutMs = timeoutArg ? Number(timeoutArg) : 120_000;

async function main() {
  const user = userIdArg
    ? await prisma.user.findUnique({ where: { id: userIdArg }, select: { id: true } })
    : await prisma.user.findFirst({
        where: { model_configs: { some: { is_default: true, is_deleted: false, purpose: 'chat' } } },
        select: { id: true },
      });
  if (!user) throw new Error('没有找到配置了默认聊天模型的校准用户');

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('--timeout-ms 必须是正数');
  const fixtures = fixtureArg
    ? contentQualityFixtures.filter((fixture) => fixture.id === fixtureArg)
    : contentQualityFixtures;
  if (fixtures.length === 0) throw new Error(`未知校准样本 ${fixtureArg}`);

  let failed = 0;
  for (const fixture of fixtures) {
    console.error(`[calibration] start ${fixture.id} (timeout ${timeoutMs}ms)`);
    const startedAt = Date.now();
    const result = await evaluateResumeContent(user.id, fixture.content, {
      maxRetries: 0,
      timeout: timeoutMs,
    });
    const issueDimensions = new Set(result.issues.map((issue) => issue.dimension));
    const missingDimensions = fixture.expectedIssueDimensions.filter((dimension) => !issueDimensions.has(dimension as never));
    const scoreInRange = result.score >= fixture.expectedScore.min && result.score <= fixture.expectedScore.max;
    const entityClaim = fixture.id === 'fictional-entity-neutrality'
      && result.issues.some((issue) => /虚构|不存在|造假|真实性/.test(`${issue.reason}${issue.suggestion}`));
    const passed = scoreInRange && missingDimensions.length === 0 && !entityClaim;
    if (!passed) failed += 1;
    console.log(JSON.stringify({
      fixture: fixture.id,
      description: fixture.description,
      passed,
      score: result.score,
      expectedScore: fixture.expectedScore,
      issueCount: result.issues.length,
      issueDimensions: [...issueDimensions],
      missingDimensions,
      entityTruthClaim: entityClaim,
      modelName: result.modelName,
      promptVersion: result.promptVersion,
      evaluatorVersion: result.evaluatorVersion,
      durationMs: Date.now() - startedAt,
    }));
  }
  if (failed > 0) throw new Error(`${failed} 个内容质量校准样本未通过`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
