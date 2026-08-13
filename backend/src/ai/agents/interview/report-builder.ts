import type { Answer, CandidateProfile, Evaluation, InterviewReport, Question } from '../../types/interview.types';

interface RubricSnapshot {
  version: string;
  mode: 'general' | 'job_profile';
  dimensions: Array<{ key: string; label: string; weight: number }>;
}

export interface DeterministicInterviewReport extends InterviewReport {
  dimensionScores: Array<{ key: string; label: string; score: number; weight: number; questionCount: number }>;
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
  const dimensionScores = rubric.dimensions.map((dimension) => {
    const related = questions.flatMap((question) => {
      const evaluation = evaluationById.get(question.id);
      return evaluation && evaluation.score > 0 && question.dimensionKeys.includes(dimension.key) ? [evaluation.score] : [];
    });
    return { key: dimension.key, label: dimension.label,
      score: related.length ? Math.round((related.reduce((sum, score) => sum + score, 0) / related.length) * 10) : 0,
      weight: dimension.weight, questionCount: related.length };
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
    reportVersion: 'interview-report-v2-deterministic',
    rubricVersion: rubric.version,
  };
}
