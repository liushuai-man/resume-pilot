import { StringOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import {
  createUserLLM,
  getUserModelClientConfig,
} from '../ai/providers/llm.provider';
import {
  buildJobMatchOptimizationPrompt,
  JOB_MATCH_OPTIMIZATION_EVALUATOR_VERSION,
  JOB_MATCH_OPTIMIZATION_PROMPT_VERSION,
} from '../ai/prompts/job-match-optimization.prompt';

const schema = z.object({
  suggestedText: z.string().trim().min(1).max(4000),
  reason: z.string().trim().min(1).max(600),
  usedUserFacts: z.array(z.string().trim().min(1).max(500)).max(10),
});
const normalize = (value: string) =>
  value.normalize('NFKC').replace(/\s+/g, '');
const parseJson = (value: string) =>
  JSON.parse(
    value
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
  );

export function parseJobMatchOptimizationOutput(
  output: string,
  originalText: string,
  userFacts: string
) {
  const parsed = schema.parse(parseJson(output));
  for (const fact of parsed.usedUserFacts)
    if (!normalize(userFacts).includes(normalize(fact)))
      throw new Error('优化建议引用了不存在的用户事实');
  const allowedNumbers = new Set(
    `${originalText}\n${userFacts}`.match(/\d+(?:\.\d+)?%?/g) || []
  );
  const introduced = (
    parsed.suggestedText.match(/\d+(?:\.\d+)?%?/g) || []
  ).find((value) => !allowedNumbers.has(value));
  if (introduced) throw new Error(`优化建议引入了未经提供的数字 ${introduced}`);
  return {
    mode: 'suggestion' as const,
    originalText,
    ...parsed,
    promptVersion: JOB_MATCH_OPTIMIZATION_PROMPT_VERSION,
    evaluatorVersion: JOB_MATCH_OPTIMIZATION_EVALUATOR_VERSION,
  };
}

export async function generateJobMatchOptimization(
  userId: string,
  requirement: any,
  userFacts = ''
) {
  if (!userFacts.trim())
    return {
      mode: 'needs_input' as const,
      originalText: requirement.resumeEvidence,
      questions: [
        '你在哪段经历或项目中实际使用过这项能力？',
        '当时完成了什么任务，采取了哪些行动？',
        '有什么可确认的结果或产出？',
      ],
      promptVersion: JOB_MATCH_OPTIMIZATION_PROMPT_VERSION,
      evaluatorVersion: JOB_MATCH_OPTIMIZATION_EVALUATOR_VERSION,
    };
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
    .invoke(
      buildJobMatchOptimizationPrompt({
        originalText: requirement.resumeEvidence,
        requirementName: requirement.requirementName,
        jdEvidence: requirement.jdEvidence,
        reason: requirement.reason,
        userFacts,
      })
    );
  return {
    ...parseJobMatchOptimizationOutput(
      output,
      requirement.resumeEvidence,
      userFacts
    ),
    modelName: config.model_name,
  };
}
