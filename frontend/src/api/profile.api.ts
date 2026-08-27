import request from '@/utils/request';
export interface CapabilityEvidence { interviewId: string; position: string; date: string; answerExcerpt: string; rationale: string }
export interface CapabilityMetric { key: string; label: string; score: number; interviewSamples: number; evidenceCount: number; confidence?: 'low'|'medium'|'high'; evidence?: CapabilityEvidence[] }
export interface ProfileOverview {
  user: { github_login: string; github_avatar?: string; created_at: string };
  interview: { count: number; averageScore: number | null; latestScore: number | null; trend: Array<{ id: string; position: string; score: number; date: string }> };
  resumeQuality: { latestContentScore: number | null; contentConfidence: number | null; latestMatchScore: number | null; matchConfidence: number | null; acceptedOptimizations: number; resolvedOptimizations: number; averageScoreDelta: number | null };
  capabilityProfile: CapabilityMetric[];
  positionProfiles: Array<{ key: string; label: string; interviewCount: number; averageScore: number; latestScore: number | null; capabilityProfile: CapabilityMetric[] }>;
  capabilityMinimumSamples: number;
  recentActivity: Array<{ id: string; type: string; title: string; detail: string; date: string; href: string }>;
  funnel: { jobDescriptions: number; confirmedProfiles: number; matchAnalyses: number; interviewsStarted: number; reportsCompleted: number };
}
export const profileApi = { getOverview: async (): Promise<ProfileOverview> => { const response: any = await request.get('/profile/overview'); return response.data || response; } };
