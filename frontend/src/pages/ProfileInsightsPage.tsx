import { Button, Loader, Text } from '@mantine/core';
import CapabilityProfile from '@/components/profile/CapabilityProfile';
import InterviewTrend from '@/components/profile/InterviewTrend';
import PositionProfiles from '@/components/profile/PositionProfiles';
import { useProfileOverview } from '@/hooks/useProfileOverview';
import { useNavigate } from 'react-router-dom';

export default function ProfileInsightsPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useProfileOverview();
  if (loading) return <div className="flex min-h-[480px] items-center justify-center"><Loader size="xl"/></div>;
  if (error || !data) return <div className="flex min-h-[480px] flex-col items-center justify-center gap-3"><Text c="dimmed">能力画像数据加载失败</Text><Button onClick={() => window.location.reload()}>重新加载</Button></div>;
  return <><div className="mb-5 min-h-12 border-b border-[#D8E1DD] pb-4"><p className="text-sm text-[#66736D]">基于正式面试评价观察能力变化，不用单次结果推断长期表现。</p></div><div className="grid gap-5 lg:grid-cols-2"><InterviewTrend data={data} onOpen={(id) => navigate(`/interviews/results/${id}`)}/><PositionProfiles data={data}/></div><div className="mt-5"><CapabilityProfile data={data}/></div><p className="mt-5 text-xs text-[#718079]">画像仅使用你主动填写的数据与系统正式评价，不推断性格、健康或身份等敏感属性。</p></>;
}
