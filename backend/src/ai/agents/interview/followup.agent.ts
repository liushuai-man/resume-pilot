import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createUserLLM } from '../../providers/llm.provider';
import { FOLLOWUP_QUESTION_PROMPT } from '../../prompts/interview/followup.prompt';
import {
  Question,
  Evaluation,
  CandidateProfile,
} from '../../types/interview.types';

function cleanJson(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```'))
    cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

export class FollowUpAgent {
  async generateQuestion(
    currentQuestion: Question,
    userAnswer: string,
    evaluation: Evaluation,
    candidateProfile: CandidateProfile,
    userId?: string
  ): Promise<Question | null> {
    const llm = await createUserLLM(userId, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    const chain = RunnableSequence.from([
      FOLLOWUP_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    try {
      const result = await chain.invoke({
        currentQuestion: currentQuestion.content,
        userAnswer,
        score: evaluation.score.toString(),
        strengths: evaluation.strengths?.join(', ') || '无',
        weaknesses: evaluation.weaknesses?.join(', ') || '无',
        knowledgeGap: evaluation.knowledgeGap?.join(', ') || '无',
        followUpSuggestion: evaluation.followUpSuggestion || '无',
        candidateProfile: JSON.stringify(candidateProfile, null, 2),
      });

      const parsed = JSON.parse(cleanJson(result));

      return {
        id: `q-${Date.now()}-followup`,
        content: parsed.question,
        section: currentQuestion.section,
        sectionKey: currentQuestion.sectionKey,
        type: 'followup',
        topic: parsed.topic || currentQuestion.topic,
        difficulty: parsed.difficulty || 'medium',
        followUpFrom: parsed.followUpFrom || currentQuestion.topic,
      };
    } catch (error) {
      console.error('FollowUp Agent 生成追问失败:', error);
      return null;
    }
  }
}
