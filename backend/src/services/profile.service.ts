import { prisma } from '../database/prisma';

interface InterviewRow { id: string; position: string; score: number; report: unknown; completed_at: Date | null; created_at: Date }
interface AnalysisRow { id: string; resume_id: string; score: number; overall_confidence: number; created_at: Date }
interface ActionRow { id: string; score_before: number | null; score_after: number | null; resolved: boolean | null }
interface Dimension { key: string; label: string; score: number; questionCount: number }

const contextOf = (value: unknown) => value && typeof value === 'object'
  ? (value as { interviewContext?: { jobProfile?: { id?: string; jobTitle?: string } | null } }).interviewContext
  : undefined;

const dimensionsOf = (value: unknown): Dimension[] => {
  if (!value || typeof value !== 'object') return [];
  const dimensions = (value as { dimensionScores?: unknown }).dimensionScores;
  return Array.isArray(dimensions) ? dimensions as Dimension[] : [];
};

export async function getUserProfileOverview(userId: string) {
  const [user, rawInterviews, rawContent, rawMatches, rawActions] = await Promise.all([
    prisma.user.findFirst({ where: { id: userId, is_deleted: false }, select: { id: true, github_login: true, github_avatar: true, created_at: true } }),
    prisma.interviewResult.findMany({ where: { user_id: userId, is_deleted: false, status: 'completed' }, orderBy: { completed_at: 'asc' }, select: { id: true, position: true, score: true, report: true, completed_at: true, created_at: true } }),
    prisma.resumeContentAnalysis.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' }, take: 12, select: { id: true, resume_id: true, score: true, overall_confidence: true, created_at: true } }),
    prisma.jobMatchAnalysis.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' }, take: 12, select: { id: true, resume_id: true, score: true, overall_confidence: true, created_at: true } }),
    prisma.resumeOptimizationAction.findMany({ where: { user_id: userId, status: 'accepted' }, orderBy: { created_at: 'desc' }, take: 20, select: { id: true, score_before: true, score_after: true, resolved: true } }),
  ]);
  if (!user) throw new Error('USER_NOT_FOUND');
  const interviews = rawInterviews as InterviewRow[];
  const content = rawContent as AnalysisRow[];
  const matches = rawMatches as AnalysisRow[];
  const actions = rawActions as ActionRow[];

  const groups = new Map<string, { label: string; scores: number[]; evidenceCount: number }>();
  const positionGroups = new Map<string, { label: string; interviews: InterviewRow[] }>();
  interviews.forEach((interview) => dimensionsOf(interview.report).forEach((dimension) => {
    if (!dimension.questionCount) return;
    const group = groups.get(dimension.key) || { label: dimension.label, scores: [], evidenceCount: 0 };
    group.scores.push(dimension.score);
    group.evidenceCount += dimension.questionCount;
    groups.set(dimension.key, group);
  }));
  interviews.forEach((interview) => {
    const profile = contextOf(interview.report)?.jobProfile;
    const key = profile?.id || 'general';
    const group = positionGroups.get(key) || { label: profile?.jobTitle || '通用岗位', interviews: [] };
    group.interviews.push(interview);
    positionGroups.set(key, group);
  });
  const trend = interviews.map((item) => ({ id: item.id, position: item.position, score: item.score, date: item.completed_at || item.created_at }));
  const scoredActions = actions.filter((item) => item.score_before != null && item.score_after != null);
  const recentActivity = [
    ...interviews.slice(-5).map((item) => ({ id: item.id, type: 'interview', title: `${item.position}面试报告`, detail: `${item.score} 分`, date: item.completed_at || item.created_at, href: `/interviews/results/${item.id}` })),
    ...content.slice(0, 3).map((item) => ({ id: item.id, type: 'content', title: '简历内容质量评价', detail: `${item.score} 分`, date: item.created_at, href: `/resumes/${item.resume_id}/edit` })),
    ...matches.slice(0, 3).map((item) => ({ id: item.id, type: 'match', title: '岗位匹配评价', detail: `${item.score} 分`, date: item.created_at, href: '/jobs' })),
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 8);
  const [jobDescriptionCount, confirmedProfileCount] = await Promise.all([
    prisma.jobDescription.count({ where: { user_id: userId, is_deleted: false } }),
    prisma.jobProfile.count({ where: { user_id: userId, status: 'confirmed' } }),
  ]);

  return {
    user,
    interview: { count: interviews.length, averageScore: interviews.length ? Math.round(interviews.reduce((sum, item) => sum + item.score, 0) / interviews.length) : null, latestScore: trend.at(-1)?.score ?? null, trend },
    resumeQuality: { latestContentScore: content[0]?.score ?? null, contentConfidence: content[0]?.overall_confidence ?? null, latestMatchScore: matches[0]?.score ?? null, matchConfidence: matches[0]?.overall_confidence ?? null, acceptedOptimizations: actions.length, resolvedOptimizations: actions.filter((item) => item.resolved).length, averageScoreDelta: scoredActions.length ? Math.round(scoredActions.reduce((sum, item) => sum + item.score_after! - item.score_before!, 0) / scoredActions.length) : null },
    capabilityProfile: interviews.length < 2 ? [] : [...groups.entries()].map(([key, item]) => ({ key, label: item.label, score: Math.round(item.scores.reduce((sum, score) => sum + score, 0) / item.scores.length), interviewSamples: item.scores.length, evidenceCount: item.evidenceCount, confidence: item.scores.length >= 5 ? 'high' : item.scores.length >= 3 ? 'medium' : 'low' })),
    positionProfiles: [...positionGroups.entries()].map(([key, group]) => ({ key, label: group.label, interviewCount: group.interviews.length, averageScore: Math.round(group.interviews.reduce((sum, item) => sum + item.score, 0) / group.interviews.length), latestScore: group.interviews.at(-1)?.score ?? null, capabilityProfile: group.interviews.length < 2 ? [] : [...new Map(group.interviews.flatMap((interview) => dimensionsOf(interview.report).filter((item) => item.questionCount).map((dimension) => [dimension.key, { label: dimension.label, values: [] as number[], evidenceCount: 0 }]))).entries()].map(([dimensionKey, dimensionGroup]) => { group.interviews.forEach((interview) => dimensionsOf(interview.report).filter((item) => item.key === dimensionKey && item.questionCount).forEach((item) => { dimensionGroup.values.push(item.score); dimensionGroup.evidenceCount += item.questionCount; })); return { key: dimensionKey, label: dimensionGroup.label, score: Math.round(dimensionGroup.values.reduce((sum, score) => sum + score, 0) / dimensionGroup.values.length), interviewSamples: dimensionGroup.values.length, evidenceCount: dimensionGroup.evidenceCount }; }) })),
    capabilityMinimumSamples: 2,
    recentActivity,
    funnel: { jobDescriptions: jobDescriptionCount, confirmedProfiles: confirmedProfileCount, matchAnalyses: matches.length, interviewsStarted: interviews.length, reportsCompleted: interviews.length },
    generatedAt: new Date(),
  };
}
