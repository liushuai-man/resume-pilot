import { useEffect, useState } from 'react';
import { profileApi, type ProfileOverview } from '@/api/profile.api';
import { useUserStore } from '@/store/useUserStore';
import { guestWorkspace } from '@/services/guest-workspace';

export function useProfileOverview() {
  const isGuest = useUserStore((state) => state.isGuest);
  const [data, setData] = useState<ProfileOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (isGuest) {
      Promise.all([guestWorkspace.listResumes(), guestWorkspace.listJobs(), guestWorkspace.listAnalyses(), guestWorkspace.listInterviewResults()]).then(([resumes, jobs, analyses, results]) => {
        const completed = results.filter((item) => item.status === 'completed' && item.report);
        const scores = completed.map((item) => item.score);
        const latest = completed[0];
        const dimensions = latest?.report?.dimensionScores || [];
        const latestQuality = analyses.find((item) => item.kind === 'content-quality');
        const latestMatch = analyses.find((item) => item.kind === 'job-match');
        setData({
          user: { github_login: '游客工作区', created_at: new Date().toISOString() },
          interview: { count: completed.length, averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null, latestScore: latest?.score ?? null, trend: completed.map((item) => ({ id: item.id, position: item.position, score: item.score, date: item.created_at })) },
          resumeQuality: { latestContentScore: latestQuality?.result.score ?? null, contentConfidence: latestQuality?.result.overallConfidence ?? null, latestMatchScore: latestMatch?.result.score ?? null, matchConfidence: latestMatch?.result.overallConfidence ?? null, acceptedOptimizations: 0, resolvedOptimizations: 0, averageScoreDelta: null },
          capabilityProfile: dimensions.map((item) => ({ key: item.key, label: item.label, score: item.score, interviewSamples: completed.length, evidenceCount: item.questionCount, confidence: completed.length >= 3 ? 'medium' : 'low' })),
          positionProfiles: [], capabilityMinimumSamples: 3,
          recentActivity: [
            ...completed.map((item) => ({ id: item.id, type: 'interview', title: item.position, detail: `${item.score} 分`, date: item.created_at, href: `/interviews/results/${item.id}` })),
            ...resumes.map((item) => ({ id: item.id, type: 'resume', title: item.title, detail: '本机简历', date: item.updated_at, href: `/resumes/${item.id}/edit` })),
          ].slice(0, 6),
          funnel: { jobDescriptions: jobs.length, confirmedProfiles: jobs.filter((item) => item.latestProfile?.status === 'confirmed').length, matchAnalyses: analyses.filter((item) => item.kind === 'job-match').length, interviewsStarted: results.length, reportsCompleted: completed.length },
        });
      }).catch(() => setError(true)).finally(() => setLoading(false));
      return;
    }
    profileApi.getOverview().then(setData).catch(() => setError(true)).finally(() => setLoading(false));
  }, [isGuest]);
  return { data, loading, error };
}
