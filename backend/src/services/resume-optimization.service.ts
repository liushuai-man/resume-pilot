import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import {
  createUserLLM,
  getUserModelClientConfig,
} from '../ai/providers/llm.provider';
import {
  buildResumeOptimizationPrompt,
  RESUME_OPTIMIZATION_EVALUATOR_VERSION,
  RESUME_OPTIMIZATION_PROMPT_VERSION,
} from '../ai/prompts/resume-optimization.prompt';
import type { ContentQualityIssue } from '../types/content-quality.types';

const outputSchema = z.object({
  suggestedText: z.string().trim().min(1).max(4000),
  reason: z.string().trim().min(1).max(600),
  usedUserFacts: z.array(z.string().trim().min(1).max(500)).max(10),
});
const parseJson = (value: string) =>
  JSON.parse(
    value
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
  );
const normalized = (value: string) =>
  value.normalize('NFKC').replace(/\s+/g, '');

export function parseOptimizationOutput(
  output: string,
  issue: ContentQualityIssue,
  userFacts: string
) {
  const parsed = outputSchema.parse(parseJson(output));
  for (const fact of parsed.usedUserFacts) {
    if (!normalized(userFacts).includes(normalized(fact)))
      throw new Error('优化建议引用了不存在的用户事实');
  }
  const allowedNumbers = new Set(
    `${issue.evidence}\n${userFacts}`.match(/\d+(?:\.\d+)?%?/g) || []
  );
  const introducedNumber = (
    parsed.suggestedText.match(/\d+(?:\.\d+)?%?/g) || []
  ).find((value) => !allowedNumbers.has(value));
  if (introducedNumber)
    throw new Error(`优化建议引入了未经提供的数字 ${introducedNumber}`);
  return {
    mode: 'suggestion' as const,
    originalText: issue.evidence,
    ...parsed,
    promptVersion: RESUME_OPTIMIZATION_PROMPT_VERSION,
    evaluatorVersion: RESUME_OPTIMIZATION_EVALUATOR_VERSION,
  };
}

export async function generateResumeOptimization(
  userId: string,
  issue: ContentQualityIssue,
  userFacts = ''
) {
  if (issue.dimension === 'evidenceSpecificity' && !userFacts.trim()) {
    return {
      mode: 'needs_input' as const,
      originalText: issue.evidence,
      questions: [
        '这项工作解决了什么具体问题？',
        '你采取了哪些关键行动或使用了哪些技术？',
        '结果如何，是否有可确认的数字或业务变化？',
      ],
      promptVersion: RESUME_OPTIMIZATION_PROMPT_VERSION,
      evaluatorVersion: RESUME_OPTIMIZATION_EVALUATOR_VERSION,
    };
  }
  const config = await getUserModelClientConfig(userId);
  const llm = await createUserLLM(userId, {
    temperature: 0.1,
    maxTokens: 1600,
    modelKwargs: {
      response_format: { type: 'json_object' },
      thinking_budget: 384,
    },
  });
  const output = await llm
    .pipe(new StringOutputParser())
    .invoke(buildResumeOptimizationPrompt(issue, userFacts));
  return {
    ...parseOptimizationOutput(output, issue, userFacts),
    modelName: config.model_name,
  };
}
