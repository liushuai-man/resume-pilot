import { createHash } from 'node:crypto';
import { z } from 'zod';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM, getUserModelClientConfig } from '../ai/providers/llm.provider';
import {
  buildContentQualityPrompt,
  CONTENT_QUALITY_EVALUATOR_VERSION,
  CONTENT_QUALITY_PROMPT_VERSION,
  type ResumeQualityField,
} from '../ai/prompts/content-quality.prompt';
import type { ContentQualityResult } from '../types/content-quality.types';

const dimensionMaxScores = {
  coherence: 25,
  informationValue: 25,
  evidenceSpecificity: 25,
  consistency: 15,
  professionalism: 10,
} as const;

const dimensionKeySchema = z.enum(['coherence', 'informationValue', 'evidenceSpecificity', 'consistency', 'professionalism']);
const outputSchema = z.object({
  dimensions: z.array(z.object({
    key: dimensionKeySchema,
    score: z.number().int().min(0),
    confidence: z.number().min(0).max(1),
    reason: z.string().trim().min(1).max(500),
  })).length(5),
  issues: z.array(z.object({
    fieldId: z.string().trim().min(1),
    evidence: z.string().trim().min(1).max(1000),
    dimension: dimensionKeySchema,
    severity: z.enum(['error', 'warning', 'suggestion']),
    reason: z.string().trim().min(1).max(500),
    suggestion: z.string().trim().min(1).max(500),
    confidence: z.number().min(0).max(1),
  })).max(50),
  overallConfidence: z.number().min(0).max(1),
});

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const list = (value: unknown): any[] => Array.isArray(value) ? value : [];

function normalizeContent(input: unknown): any {
  let value = input;
  for (let count = 0; count < 2 && typeof value === 'string'; count += 1) {
    try { value = JSON.parse(value); } catch { return {}; }
  }
  return value && typeof value === 'object' ? value : {};
}

export function extractResumeQualityFields(input: unknown): ResumeQualityField[] {
  const content = normalizeContent(input);
  const blocks = list(content.blocks);
  const byType = (type: string) => blocks.find((block) => block?.type === type)?.data;
  const fields: ResumeQualityField[] = [];
  const add = (section: string, itemId: string | null, field: string, value: unknown) => {
    const contentText = Array.isArray(value) ? value.map(text).filter(Boolean).join('\n') : text(value);
    if (!contentText) return;
    fields.push({ fieldId: `${section}:${itemId || 'root'}:${field}`, section, itemId, field, content: contentText.slice(0, 4000) });
  };

  const profile = byType('basic') || content.basicInfo || {};
  add('basic', null, 'title', profile.title);
  add('basic', null, 'summary', profile.summary || profile.bio);
  const objectiveData = byType('objective');
  add('objective', null, 'content', typeof objectiveData === 'string' ? objectiveData : objectiveData?.objective || objectiveData?.content || content.careerObjective);

  const education = list(byType('education') || content.education);
  education.forEach((item, index) => {
    const id = text(item.id) || String(index);
    add('education', id, 'school', item.school);
    add('education', id, 'major', item.major);
    add('education', id, 'description', item.description);
  });
  const experiences = list(byType('experience') || content.experience);
  experiences.forEach((item, index) => {
    const id = text(item.id) || String(index);
    add('experience', id, 'position', item.position);
    add('experience', id, 'description', [...(Array.isArray(item.description) ? item.description : [item.description]), ...list(item.achievements)]);
  });
  const projects = list(byType('projects') || byType('project') || content.projects);
  projects.forEach((item, index) => {
    const id = text(item.id) || String(index);
    add('projects', id, 'role', item.role);
    add('projects', id, 'description', [...(Array.isArray(item.description) ? item.description : [item.description]), ...list(item.achievements)]);
  });
  const skills = list(byType('skills') || byType('skill') || content.skills);
  skills.forEach((item, index) => add('skills', typeof item === 'string' ? String(index) : text(item.id) || String(index), 'name', typeof item === 'string' ? item : item.name));
  return fields;
}

const normalizeEvidence = (value: string) => value.normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase();
const parseJsonOutput = (output: string) => JSON.parse(output.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));

export function parseContentQualityOutput(output: string, fields: ResumeQualityField[]): Omit<ContentQualityResult, 'modelName'> {
  const parsed = outputSchema.parse(parseJsonOutput(output));
  const fieldMap = new Map(fields.map((field) => [field.fieldId, field]));
  const uniqueDimensions = new Map(parsed.dimensions.map((dimension) => [dimension.key, dimension]));
  if (uniqueDimensions.size !== 5) throw new Error('内容质量评价维度不完整或重复');
  const dimensions = Object.entries(dimensionMaxScores).map(([key, maxScore]) => {
    const dimension = uniqueDimensions.get(key as keyof typeof dimensionMaxScores);
    if (!dimension || dimension.score > maxScore) throw new Error(`内容质量维度 ${key} 分数无效`);
    return { ...dimension, maxScore };
  });
  const issues = parsed.issues.map((issue) => {
    const field = fieldMap.get(issue.fieldId);
    if (!field) throw new Error(`内容质量问题引用了不存在的字段 ${issue.fieldId}`);
    if (!normalizeEvidence(field.content).includes(normalizeEvidence(issue.evidence))) {
      throw new Error(`内容质量问题的证据无法在字段 ${issue.fieldId} 中定位`);
    }
    return {
      ...issue,
      section: field.section,
      itemId: field.itemId,
      field: field.field,
      status: issue.confidence >= 0.7 ? 'confirmed' as const : 'needs_confirmation' as const,
    };
  });
  return {
    score: dimensions.reduce((sum, dimension) => sum + dimension.score, 0),
    dimensions,
    issues,
    overallConfidence: parsed.overallConfidence,
    promptVersion: CONTENT_QUALITY_PROMPT_VERSION,
    evaluatorVersion: CONTENT_QUALITY_EVALUATOR_VERSION,
  };
}

export async function evaluateResumeContent(userId: string, content: unknown): Promise<ContentQualityResult> {
  const fields = extractResumeQualityFields(content);
  if (fields.length === 0) throw new Error('简历没有可评价的文本字段');
  const config = await getUserModelClientConfig(userId);
  const llm = await createUserLLM(userId, { temperature: 0.1, maxTokens: 3500 });
  const output = await llm.pipe(new StringOutputParser()).invoke(buildContentQualityPrompt(fields));
  return { ...parseContentQualityOutput(output, fields), modelName: config.model_name };
}

export function hashResumeContent(content: unknown): string {
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}
