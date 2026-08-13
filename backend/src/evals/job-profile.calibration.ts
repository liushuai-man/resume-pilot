import 'dotenv/config';
import { prisma } from '../database/prisma';
import { parseJobDescription, JOB_PROFILE_PARSER_VERSION, JOB_PROFILE_PROMPT_VERSION } from '../services/job-profile.service';
import { jobProfileFixtures } from './job-profile.fixtures';
import { createModelConfig } from '../services/model-config.service';

const normalized = (value: string) => value.toLocaleLowerCase().replace(/\s+/g, '');

async function ensureCalibrationModel(userId: string) {
  const currentConfig = await prisma.userModelConfig.findFirst({
    where: { user_id: userId, is_deleted: false, is_default: true, purpose: 'chat' },
  });
  if (currentConfig) return null;
  if (!process.env.MIMO_API_KEY) throw new Error('CALIBRATION_MODEL_REQUIRED');

  const temporary = await createModelConfig(userId, {
    provider: 'mimo',
    modelName: 'mimo-v2.5',
    apiKey: process.env.MIMO_API_KEY,
    baseUrl: process.env.MIMO_API_BASE_URL,
    displayName: 'CODEX_V2_CALIBRATION_TEMP',
    isDefault: true,
    purpose: 'chat',
  });
  return temporary.id;
}

function assertFixtureResult(
  fixture: (typeof jobProfileFixtures)[number],
  profile: Awaited<ReturnType<typeof parseJobDescription>>,
) {
  const serialized = normalized(JSON.stringify(profile));
  const missingTerms = fixture.expectedTerms.filter(
    (term) => !serialized.includes(normalized(term)),
  );
  const seniorityMatched = fixture.expectedSeniority.some(
    (term) => normalized(profile.seniority || '').includes(normalized(term)),
  );
  const requirements = [
    ...profile.responsibilities,
    ...profile.requiredSkills,
    ...profile.preferredSkills,
  ];
  if (!profile.jobTitle || !requirements.length || missingTerms.length || !seniorityMatched) {
    throw new Error(`${fixture.id}: PROFILE_ACCEPTANCE_FAILED ${JSON.stringify({
      missingTerms,
      seniority: profile.seniority,
    })}`);
  }
  return requirements.length;
}

async function main() {
  const user = await prisma.user.findFirst({ where: { is_deleted: false }, select: { id: true } });
  if (!user) throw new Error('CALIBRATION_USER_REQUIRED');
  const temporaryConfigId = await ensureCalibrationModel(user.id);
  const results = [];
  try {
    for (const fixture of jobProfileFixtures) {
      const startedAt = Date.now();
      const profile = await parseJobDescription(user.id, fixture.rawText);
      const requirements = assertFixtureResult(fixture, profile);
      results.push({
        id: fixture.id,
        jobTitle: profile.jobTitle,
        seniority: profile.seniority,
        requirements,
        confidence: profile.confidence,
        model: profile.modelName,
        durationMs: Date.now() - startedAt,
      });
    }
  } finally {
    if (temporaryConfigId) {
      await prisma.userModelConfig.deleteMany({
        where: { id: temporaryConfigId, display_name: 'CODEX_V2_CALIBRATION_TEMP' },
      });
    }
  }
  console.log(JSON.stringify({
    promptVersion: JOB_PROFILE_PROMPT_VERSION,
    parserVersion: JOB_PROFILE_PARSER_VERSION,
    passed: results.length,
    results,
  }, null, 2));
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
