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
    if (process.env.INTERVIEW_DETAILED_EVALUATION !== 'true') {
      return questions.flatMap((question) => {
        const answer = answers.find((item) => item.questionId === question.id);
        return answer ? [this.evaluateQuickly(question, answer.content)] : [];
      });
    }
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
    if (process.env.INTERVIEW_DETAILED_EVALUATION !== 'true') {
      return this.evaluateQuickly(question, answer);
    }

    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 320,
    });

    const chain = RunnableSequence.from([
      EVALUATE_ANSWER_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
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
      };
    } catch (error) {
      console.error('Evaluation Agent 评估失败:', error);
      return {
        questionId: question.id,
        score: 5,
        feedback: '评估过程中出现错误，请继续回答下一题。',
        strengths: [],
        weaknesses: ['回答需要改进'],
        knowledgeGap: [],
        followUpSuggestion: '',
        profileUpdate: null,
      };
    }
  }

  private evaluateQuickly(question: Question, answer: string): Evaluation {
    const text = answer.trim();
    const length = text.length;
    const hasExample = /例如|比如|项目|实践|负责|实现|优化|结果|数据|because|example/i.test(text);
    const hasStructure = /首先|其次|最后|一是|二是|第一|第二|first|then|finally/i.test(text);
    const score = Math.max(3, Math.min(9, 4 + (length >= 80 ? 2 : length >= 35 ? 1 : 0) + (hasExample ? 2 : 0) + (hasStructure ? 1 : 0)));
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    if (length >= 35) strengths.push('回答覆盖了核心信息');
    else weaknesses.push('回答较短，关键判断依据还不够明确');
    if (hasExample) strengths.push('结合了具体经历或案例');
    else weaknesses.push('可补充一个实际项目或工作场景');
    if (hasStructure) strengths.push('表达具有清晰的结构');
    else weaknesses.push('建议按“背景—行动—结果”组织表达');

    return {
      questionId: question.id,
      score,
      knowledgeLevel: score >= 8 ? '熟练' : score >= 6 ? '了解' : '待加强',
      feedback: score >= 7
        ? '回答方向准确。下一次可再补充量化结果或技术取舍，让说服力更强。'
        : '已捕捉到你的主要思路。建议补充具体做法、遇到的困难以及最终结果。',
      strengths,
      weaknesses,
      knowledgeGap: weaknesses,
      followUpSuggestion: `围绕${question.topic || question.section || '该主题'}补充一个具体案例`,
      profileUpdate: {
        skill: question.topic || question.section || '综合能力',
        level: score,
        confidence: Math.min(0.9, 0.4 + length / 300),
      },
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
      followUpSuggestion: String(item.followUpSuggestion || ''), profileUpdate: item.profileUpdate || null } as Evaluation;
  });
  if (seen.size !== expectedIds.length || expectedIds.some((id) => !seen.has(id))) throw new Error('BATCH_EVALUATION_INCOMPLETE');
  return evaluations;
}
