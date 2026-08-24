import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import {
  createUserLLM,
  getUserModelClientConfig,
} from '../ai/providers/llm.provider';
import {
  buildJobMatchPrompt,
  JOB_MATCH_EVALUATOR_VERSION,
  JOB_MATCH_PROMPT_VERSION,
  type MatchRequirement,
} from '../ai/prompts/job-match.prompt';
import { extractResumeQualityFields } from './content-quality.service';

const keys = [
  'skillCoverage',
  'responsibilityRelevance',
  'keywordEvidence',
  'seniorityFit',
] as const;
const maxScores = {
  skillCoverage: 35,
  responsibilityRelevance: 30,
  keywordEvidence: 20,
  seniorityFit: 15,
} as const;
const schema = z.object({
  dimensions: z
    .array(
      z.object({
        key: z.enum(keys),
        score: z.number().int().min(0),
        confidence: z.number().min(0).max(1),
        reason: z.string().min(1).max(500),
      })
    )
    .length(4),
  requirements: z
    .array(
      z.object({
        requirementId: z.string(),
        status: z.enum([
          'matched',
          'insufficient_evidence',
          'gap',
          'needs_confirmation',
        ]),
        resumeFieldId: z.string().nullable(),
        resumeEvidence: z.string().nullable(),
        reason: z.string().min(1).max(500),
        confidence: z.number().min(0).max(1),
      })
    )
    .max(150),
  overallConfidence: z.number().min(0).max(1),
});
const normalize = (value: string) =>
  value.normalize('NFKC').replace(/\s+/g, '').toLowerCase();
const json = (value: string) =>
  JSON.parse(
    value
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
  );
const list = (value: unknown) => (Array.isArray(value) ? (value as any[]) : []);

export function buildMatchRequirements(profile: any): MatchRequirement[] {
  const groups = [
    ['responsibility', profile.responsibilities],
    ['required_skill', profile.required_skills],
    ['preferred_skill', profile.preferred_skills],
  ] as const;
  return groups.flatMap(([category, values]) =>
    list(values).map((item, index) => ({
      id: `${category}:${index}`,
      category,
      name: String(item.name || ''),
      jdEvidence: String(item.evidence || ''),
    }))
  );
}

export function parseJobMatchOutput(
  output: string,
  requirements: MatchRequirement[],
  fields: ReturnType<typeof extractResumeQualityFields>
) {
  const parsed = schema.parse(json(output));
  const dimensionMap = new Map(
    parsed.dimensions.map((item) => [item.key, item])
  );
  if (dimensionMap.size !== 4) throw new Error('岗位匹配维度不完整或重复');
  const requirementMap = new Map(requirements.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const fieldMap = new Map(fields.map((item) => [item.fieldId, item]));
  const results = parsed.requirements.map((item) => {
    const requirement = requirementMap.get(item.requirementId);
    if (!requirement || seen.has(item.requirementId))
      throw new Error('岗位要求引用无效或重复');
    seen.add(item.requirementId);
    const normalizedItem =
      item.confidence < 0.7
        ? { ...item, status: 'needs_confirmation' as const }
        : item;
    if (
      normalizedItem.status === 'matched' ||
      normalizedItem.status === 'insufficient_evidence'
    ) {
      const field = normalizedItem.resumeFieldId
        ? fieldMap.get(normalizedItem.resumeFieldId)
        : null;
      if (
        !field ||
        !normalizedItem.resumeEvidence ||
        !normalize(field.content).includes(
          normalize(normalizedItem.resumeEvidence)
        )
      )
        throw new Error('简历匹配证据无法定位');
      return {
        ...normalizedItem,
        category: requirement.category,
        requirementName: requirement.name,
        jdEvidence: requirement.jdEvidence,
        section: field.section,
        itemId: field.itemId,
        field: field.field,
      };
    }
    return {
      ...normalizedItem,
      category: requirement.category,
      requirementName: requirement.name,
      jdEvidence: requirement.jdEvidence,
      resumeFieldId: null,
      resumeEvidence: null,
      section: null,
      itemId: null,
      field: null,
    };
  });
  if (seen.size !== requirements.length) throw new Error('岗位要求评价不完整');
  const dimensions = keys.map((key) => {
    const item = dimensionMap.get(key)!;
    if (item.score > maxScores[key]) throw new Error('岗位匹配分数无效');
    return { ...item, maxScore: maxScores[key] };
  });
  return {
    score: dimensions.reduce((sum, item) => sum + item.score, 0),
    dimensions,
    requirements: results,
    overallConfidence: parsed.overallConfidence,
    promptVersion: JOB_MATCH_PROMPT_VERSION,
    evaluatorVersion: JOB_MATCH_EVALUATOR_VERSION,
  };
}

export async function evaluateJobMatch(
  userId: string,
  profile: any,
  resumeContent: unknown,
  options?: { maxRetries?: number; timeout?: number }
) {
  const fields = extractResumeQualityFields(resumeContent);
  const requirements = buildMatchRequirements(profile);
  if (!fields.length || !requirements.length)
    throw new Error('简历或岗位画像没有可匹配内容');
  const config = await getUserModelClientConfig(userId);
  const llm = await createUserLLM(userId, {
    temperature: 0.1,
    maxTokens: 5000,
    maxRetries: options?.maxRetries,
    timeout: options?.timeout,
    modelKwargs: {
      response_format: { type: 'json_object' },
      thinking_budget: 512,
    },
  });
  const output = await llm
    .pipe(new StringOutputParser())
    .invoke(buildJobMatchPrompt(profile, requirements, fields));
  return {
    ...parseJobMatchOutput(output, requirements, fields),
    modelName: config.model_name,
  };
}
