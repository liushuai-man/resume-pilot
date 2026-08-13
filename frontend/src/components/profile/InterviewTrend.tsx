import type { ProfileOverview } from '@/api/profile.api';

export default function InterviewTrend({ data, onOpen }: { data: ProfileOverview; onOpen: (id: string) => void }) {
  const items = data.interview.trend.slice(-8);
  return <section className="rounded-xl border border-[#D8E1DD] bg-white p-6"><h2 className="text-lg font-semibold">面试趋势</h2><p className="mt-1 text-sm text-[#718079]">最近 {items.length} 场正式报告，点击节点查看原始证据。</p>{items.length > 1 ? <div className="mt-6 flex h-44 items-end gap-2 border-b border-[#D8E1DD] px-2">{items.map((item) => <button key={item.id} onClick={() => onOpen(item.id)} className="group flex h-full flex-1 items-end justify-center" title={`${item.position} · ${item.score} 分`}><span className="relative w-full max-w-10 rounded-t-md bg-[#B9D2C8] transition group-hover:bg-[#176B52]" style={{ height: `${Math.max(item.score, 8)}%` }}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#52635C]">{item.score}</span></span></button>)}</div> : <div className="mt-6 rounded-lg bg-[#F4F7F6] p-5 text-sm text-[#66736D]">至少两场正式面试后展示变化趋势。</div>}</section>;
}
