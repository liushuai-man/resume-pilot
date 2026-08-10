import { z } from 'zod';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM, getUserModelClientConfig } from '../ai/providers/llm.provider';
import {
  buildJobProfilePrompt,
  JOB_PROFILE_PARSER_VERSION,
  JOB_PROFILE_PROMPT_VERSION,
} from '../ai/prompts/job-profile.prompt';
import type { ParsedJobProfile } from '../types/job.types';

const requirementSchema = z.object({
  name: z.string().trim().min(1),
  evidence: z.string().trim().min(1),
  confidence: z.number().min(0).max(1),
});

const profileSchema = z.object({
  jobTitle: z.string().trim().min(1),
  seniority: z.string().trim().optional().default(''),
  industry: z.string().trim().optional().default(''),
  responsibilities: z.array(requirementSchema).default([]),
  requiredSkills: z.array(requirementSchema).default([]),
  preferredSkills: z.array(requirementSchema).default([]),
  keywords: z.array(z.string().trim().min(1)).max(20).default([]),
  confidence: z.number().min(0).max(1),
});

const normalizeEvidenceText = (value: string) =>
  value.normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase();

export function assertProfileEvidence(
  rawText: string,
  profile: Pick<
    ParsedJobProfile,
    'responsibilities' | 'requiredSkills' | 'preferredSkills'
  >
): void {
  const normalizedSource = normalizeEvidenceText(rawText);
  const requirements = [
    ...profile.responsibilities,
    ...profile.requiredSkills,
    ...profile.preferredSkills,
  ];

  for (const requirement of requirements) {
    const evidence = normalizeEvidenceText(requirement.evidence);
    if (!evidence || !normalizedSource.includes(evidence)) {
      throw new Error(`岗位要求“${requirement.name}”的证据无法在 JD 原文中定位`);
    }
  }
}

function parseJsonOutput(output: string): unknown {
  const cleaned = output
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

export function parseJobProfileOutput(
  output: string,
  rawText: string
): ParsedJobProfile {
  const parsed = profileSchema.parse(parseJsonOutput(output));
  const profile: ParsedJobProfile = {
    ...parsed,
    seniority: parsed.seniority || undefined,
    industry: parsed.industry || undefined,
    keywords: [...new Set(parsed.keywords)],
  };
  assertProfileEvidence(rawText, profile);
  return profile;
}

export async function parseJobDescription(
  userId: string,
  rawText: string
): Promise<ParsedJobProfile & { modelName: string }> {
  const config = await getUserModelClientConfig(userId);
  const llm = await createUserLLM(userId, {
    temperature: 0.1,
    maxTokens: 2200,
  });
  const output = await llm.pipe(new StringOutputParser()).invoke(
    buildJobProfilePrompt(rawText)
  );
  const parsed = parseJobProfileOutput(output, rawText);

  return {
    ...parsed,
    modelName: config.model_name,
  };
}

export { JOB_PROFILE_PARSER_VERSION, JOB_PROFILE_PROMPT_VERSION };
