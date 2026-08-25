import type { Answer, CandidateProfile, Evaluation, InterviewReport, Question } from '../../types/interview.types';

interface RubricSnapshot {
  version: string;
  mode: 'general' | 'job_profile';
  dimensions: Array<{ key: string; label: string; weight: number }>;
}

export interface DeterministicInterviewReport extends InterviewReport {
  dimensionScores: Array<{ key: string; label: string; score: number; weight: number; questionCount: number; evidence: Array<{ questionId: string; answerExcerpt: string; rationale: string }> }>;
  candidateProfile: CandidateProfile;
  reportVersion: string;
  rubricVersion: string;
}

const unique = (items: string[]) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

export function buildInterviewReport(
  questions: Question[], answers: Answer[], evaluations: Evaluation[],
  rubric: RubricSnapshot, profile: CandidateProfile
): DeterministicInterviewReport {
  const evaluationById = new Map(evaluations.map((item) => [item.questionId, item]));
  const answerById = new Map(answers.map((item) => [item.questionId, item.content]));
  const dimensionScores = rubric.dimensions.map((dimension) => {
    const related = questions.flatMap((question) => {
      const evaluation = evaluationById.get(question.id);
      const dimensionEvaluation = evaluation?.dimensionEvaluations?.find((item) => item.key === dimension.key);
      if (dimensionEvaluation) return [{ questionId: question.id, score: dimensionEvaluation.score, rationale: dimensionEvaluation.rationale }];
      return evaluation && evaluation.score > 0 && question.dimensionKeys.includes(dimension.key)
        ? [{ questionId: question.id, score: evaluation.score, rationale: evaluation.feedback || '基于该题正式评价' }] : [];
    });
    return { key: dimension.key, label: dimension.label,
      score: related.length ? Math.round((related.reduce((sum, item) => sum + item.score, 0) / related.length) * 10) : 0,
      weight: dimension.weight, questionCount: related.length,
      evidence: related.map((item) => ({ questionId: item.questionId,
        answerExcerpt: (answerById.get(item.questionId) || '').trim().slice(0, 160), rationale: item.rationale })) };
  });
  const scoredDimensions = dimensionScores.filter((item) => item.questionCount > 0);
  const appliedWeight = scoredDimensions.reduce((sum, item) => sum + item.weight, 0);
  const overallScore = appliedWeight > 0
    ? Math.round(scoredDimensions.reduce((sum, item) => sum + item.score * item.weight, 0) / appliedWeight)
    : 0;
  const strengths = unique(evaluations.flatMap((item) => item.strengths || [])).slice(0, 6);
  const weaknesses = unique(evaluations.flatMap((item) => item.weaknesses || [])).slice(0, 6);
  const suggestions = unique(evaluations.flatMap((item) => [item.followUpSuggestion || '', ...(item.knowledgeGap || []).map((gap) => `专项复习：${gap}`)])).slice(0, 6);
  const intro = questions.find((item) => item.isIntroduction);
  const introAnswer = intro && answers.find((item) => item.questionId === intro.id);
  const introEvaluation = intro && evaluationById.get(intro.id);

  return {
    overallScore,
    introductionEvaluation: !introAnswer || ['跳过', 'skip'].includes(introAnswer.content.trim().toLowerCase())
      ? '本次面试未包含有效自我介绍。'
      : introEvaluation?.feedback,
    strengths,
    weaknesses,
    suggestions,
    dimensionScores,
    candidateProfile: profile,
    reportVersion: 'interview-report-v3-four-dimensions-evidence',
    rubricVersion: rubric.version,
  };
}
