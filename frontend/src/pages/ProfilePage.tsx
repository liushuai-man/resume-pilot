import { Avatar, Button, Loader, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import ModelSelector from '@/components/common/ModelSelector';
import CapabilityProfile from '@/components/profile/CapabilityProfile';
import InterviewTrend from '@/components/profile/InterviewTrend';
import PositionProfiles from '@/components/profile/PositionProfiles';
import EvidenceFunnel from '@/components/profile/EvidenceFunnel';
import ProfileMetrics from '@/components/profile/ProfileMetrics';
import { useProfileOverview } from '@/hooks/useProfileOverview';
import { formatDateTime } from '@/utils/format';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data, loading, error } = useProfileOverview();
  if (loading) return <div className="flex min-h-[480px] items-center justify-center"><Loader size="xl"/></div>;
  if (error || !data) return <div className="flex min-h-[480px] flex-col items-center justify-center gap-3"><Text c="dimmed">个人中心数据加载失败</Text><Button onClick={() => window.location.reload()}>重新加载</Button></div>;
  return <div className="mx-auto max-w-6xl px-6">
    <PageHeader eyebrow="EVIDENCE PROFILE" title="个人中心" description="汇总正式评价结果，观察长期变化；样本不足时不生成精确结论。"/>
    <section className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-[#D8E1DD] bg-[#EAF2EE] p-5">
      <Avatar size="lg" src={data.user.github_avatar}/><div><h2 className="font-semibold">{data.user.github_login}</h2><p className="text-xs text-[#718079]">加入于 {formatDateTime(data.user.created_at)}</p></div>
      <div className="ml-auto flex items-center gap-2"><ModelSelector variant="compact"/><Button variant="outline" onClick={() => navigate('/interviews/history')}>查看原始报告</Button></div>
    </section>
    <ProfileMetrics data={data}/>
    <div className="mt-5"><EvidenceFunnel data={data}/></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><InterviewTrend data={data} onOpen={(id) => navigate(`/interviews/results/${id}`)}/><PositionProfiles data={data}/></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]"><CapabilityProfile data={data}/><section className="rounded-xl border border-[#D8E1DD] bg-white p-6"><h2 className="text-lg font-semibold">近期活动</h2><div className="mt-4 divide-y divide-[#E4EAE7]">{data.recentActivity.length ? data.recentActivity.map((item) => <button key={`${item.type}-${item.id}`} onClick={() => navigate(item.href)} className="flex w-full items-center justify-between py-3 text-left"><span><span className="block text-sm font-medium">{item.title}</span><span className="text-xs text-[#718079]">{formatDateTime(item.date)}</span></span><span className="text-sm font-semibold text-[#176B52]">{item.detail}</span></button>) : <Text size="sm" c="dimmed">暂无正式评价活动</Text>}</div></section></div>
    <p className="mt-5 text-xs text-[#718079]">隐私说明：画像仅使用你主动填写的数据与系统正式评价，不推断性格、健康或身份等敏感属性。</p>
  </div>;
}
