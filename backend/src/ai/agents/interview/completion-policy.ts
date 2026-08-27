import type { LangGraphInterviewState } from '../../types/interview.types';

export function shouldFinishInterview(state: LangGraphInterviewState): boolean {
  const answeredCount = state.answers.length;
  if (answeredCount >= state.maxQuestions) return true;
  if (state.questionCountMode !== 'adaptive' || answeredCount < state.minQuestions) return false;

  const requiredDimensions = state.rubricSnapshot.dimensions.map((item) => item.key);
  const hasCoveredRubric = requiredDimensions.every(
    (key) => (state.coveredDimensions[key] || 0) > 0
  );
  const pendingHighPriorityPlan = state.interviewPlan.some(
    (item) => item.priority >= 2 && item.askedCount < item.count
  );
  const substantiveAnswers = state.answers.filter(
    (answer) => answer.content.trim().length >= 40
  ).length;

  return (
    (hasCoveredRubric && !pendingHighPriorityPlan && substantiveAnswers >= Math.ceil(answeredCount * 0.6)) ||
    answeredCount >= 8
  );
}
