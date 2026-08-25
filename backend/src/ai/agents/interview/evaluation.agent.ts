import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { EVALUATE_ANSWER_PROMPT, BATCH_EVALUATE_INTERVIEW_PROMPT } from '../../prompts/interview/evaluate.prompt';
import { Question, Evaluation, Answer } from '../../types/interview.types';

function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```'))
    cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

export class EvaluationAgent {
  async evaluateBatch(
    questions: Question[], answers: Answer[], resumeText: string,
    targetPosition: string, rubricSnapshot: unknown, userId?: string
  ): Promise<Evaluation[]> {
    const llm = await createUserLLM(userId, { temperature: 0.2, maxTokens: 4000 });
    const chain = RunnableSequence.from([BATCH_EVALUATE_INTERVIEW_PROMPT, llm, new StringOutputParser()]);
    const transcript = questions.map((question) => ({
      questionId: question.id, question: question.content, type: question.type,
      dimensionKeys: question.dimensionKeys,
      answer: answers.find((item) => item.questionId === question.id)?.content ?? null,
    }));
    const result = await chain.invoke({ targetPosition, rubricSnapshot: JSON.stringify(rubricSnapshot),
      resumeContent: resumeText.slice(0, 6000), transcript: JSON.stringify(transcript) });
    const parsed = JSON.parse(cleanJson(result));
    return validateBatchEvaluations(parsed.evaluations, transcript.filter((item) => item.answer !== null).map((item) => item.questionId));
  }

  async evaluate(
    question: Question,
    answer: string,
    resumeText: string,
    targetPosition: string,
    userId?: string
  ): Promise<Evaluation> {
    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 320,
    });

    const chain = RunnableSequence.from([
      EVALUATE_ANSWER_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
        question: question.content,
        answer,
        resumeSectionContent: resumeText.slice(0, 1800),
      });

      const parsed = JSON.parse(cleanJson(result));

    return {
        questionId: question.id,
        score: parsed.score,
        feedback: parsed.feedback,
        knowledgeLevel: parsed.knowledgeLevel,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        knowledgeGap: parsed.knowledgeGap || [],
        followUpSuggestion: parsed.followUpSuggestion || '',
        profileUpdate: parsed.profileUpdate || null,
        dimensionEvaluations: parsed.dimensionEvaluations || [],
    };
  }
}

export function validateBatchEvaluations(input: unknown, expectedIds: string[]): Evaluation[] {
  if (!Array.isArray(input)) throw new Error('BATCH_EVALUATION_INVALID');
  const seen = new Set<string>();
  const evaluations = input.map((item: any) => {
    if (!expectedIds.includes(item.questionId) || seen.has(item.questionId)) throw new Error('BATCH_EVALUATION_QUESTION_MISMATCH');
    seen.add(item.questionId);
    const score = Number(item.score);
    if (!Number.isInteger(score) || score < 0 || score > 10) throw new Error('BATCH_EVALUATION_SCORE_INVALID');
    return { questionId: item.questionId, score, feedback: String(item.feedback || ''),
      knowledgeLevel: item.knowledgeLevel, strengths: Array.isArray(item.strengths) ? item.strengths.map(String) : [],
      weaknesses: Array.isArray(item.weaknesses) ? item.weaknesses.map(String) : [],
      knowledgeGap: Array.isArray(item.knowledgeGap) ? item.knowledgeGap.map(String) : [],
      followUpSuggestion: String(item.followUpSuggestion || ''), profileUpdate: item.profileUpdate || null,
      dimensionEvaluations: validateDimensionEvaluations(item.dimensionEvaluations) } as Evaluation;
  });
  if (seen.size !== expectedIds.length || expectedIds.some((id) => !seen.has(id))) throw new Error('BATCH_EVALUATION_INCOMPLETE');
  return evaluations;
}

const DIMENSION_KEYS = new Set(['technical_depth', 'project_articulation', 'communication', 'problem_solving']);
function validateDimensionEvaluations(input: unknown): NonNullable<Evaluation['dimensionEvaluations']> {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input.map((item: any) => {
    const key = String(item?.key || '');
    const score = Number(item?.score);
    const rationale = String(item?.rationale || '').trim();
    if (!DIMENSION_KEYS.has(key) || seen.has(key)) throw new Error('BATCH_EVALUATION_DIMENSION_INVALID');
    if (!Number.isInteger(score) || score < 1 || score > 10 || !rationale) throw new Error('BATCH_EVALUATION_DIMENSION_INVALID');
    seen.add(key);
    return { key, score, rationale } as NonNullable<Evaluation['dimensionEvaluations']>[number];
  });
}
