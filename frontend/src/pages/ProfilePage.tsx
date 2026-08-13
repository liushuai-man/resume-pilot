import { Button, Loader, Text } from '@mantine/core';
import EvidenceFunnel from '@/components/profile/EvidenceFunnel';
import ProfileMetrics from '@/components/profile/ProfileMetrics';
import { useProfileOverview } from '@/hooks/useProfileOverview';
import { formatDateTime } from '@/utils/format';

export default function ProfilePage() {
  const { data, loading, error } = useProfileOverview();
  if (loading) return <div className="flex min-h-[480px] items-center justify-center"><Loader size="xl"/></div>;
  if (error || !data) return <div className="flex min-h-[480px] flex-col items-center justify-center gap-3"><Text c="dimmed">个人中心数据加载失败</Text><Button onClick={() => window.location.reload()}>重新加载</Button></div>;
  return <>
    <div className="mb-5 min-h-12 border-b border-[#D8E1DD] pb-4"><p className="text-sm text-[#66736D]">关键求职数据概览；样本不足的指标以“—”显示。</p></div>
    <ProfileMetrics data={data}/>
    <div className="mt-5"><EvidenceFunnel data={data}/></div>
    <section className="mt-5 rounded-xl border border-[#D8E1DD] bg-white p-6"><h2 className="text-lg font-semibold">近期活动</h2><div className="mt-4 divide-y divide-[#E4EAE7]">{data.recentActivity.length ? data.recentActivity.map((item) => <div key={`${item.type}-${item.id}`} className="flex w-full items-center justify-between py-3"><span><span className="block text-sm font-medium">{item.title}</span><span className="text-xs text-[#718079]">{formatDateTime(item.date)}</span></span><span className="text-sm font-medium text-[#52635C]">{item.detail}</span></div>) : <Text size="sm" c="dimmed">暂无正式评价活动</Text>}</div></section>
    <p className="mt-5 text-xs text-[#718079]">隐私说明：画像仅使用你主动填写的数据与系统正式评价，不推断性格、健康或身份等敏感属性。</p>
  </>;
}
