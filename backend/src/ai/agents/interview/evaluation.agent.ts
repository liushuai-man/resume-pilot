import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { EVALUATE_ANSWER_PROMPT } from '../../prompts/interview/evaluate.prompt';
import { Question, Evaluation } from '../../types/interview.types';

function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```'))
    cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

export class EvaluationAgent {
  async evaluate(
    question: Question,
    answer: string,
    resumeContent: any,
    targetPosition: string,
    userId?: string
  ): Promise<Evaluation> {
    const llm = await createUserLLM(userId, {
      temperature: 0.5,
      maxTokens: 1500,
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
        resumeSectionContent: JSON.stringify(
          resumeContent[question.sectionKey] || resumeContent,
          null,
          2
        ),
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
}
