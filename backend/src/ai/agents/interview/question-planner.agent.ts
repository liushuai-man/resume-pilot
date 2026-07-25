import { Strategy, Evaluation } from '../../types/interview.types';

export class QuestionPlannerAgent {
  decideAgent(
    strategy: Strategy,
    lastEvaluation: Evaluation | null
  ): 'technical' | 'project' | 'followup' {
    if (
      strategy.questionType === 'followup' &&
      lastEvaluation &&
      lastEvaluation.knowledgeGap &&
      lastEvaluation.knowledgeGap.length > 0
    ) {
      return 'followup';
    }

    if (strategy.questionType === 'project') {
      return 'project';
    }

    return 'technical';
  }
}
