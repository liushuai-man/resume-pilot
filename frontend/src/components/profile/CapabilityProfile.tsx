import { Link } from 'react-router-dom';
import type { ProfileOverview } from '@/api/profile.api';

const confidence = { low: '低置信度', medium: '中等置信度', high: '高置信度' };

export default function CapabilityProfile({ data }: { data: ProfileOverview }) {
  return <section className="rounded-xl border border-[#D8E1DD] bg-white p-6">
    <h2 className="text-lg font-semibold">四维能力画像</h2>
    <p className="mt-1 text-sm text-[#718079]">每次正式面试持续更新；每条结论都可回溯到回答与评价依据。</p>
    {data.capabilityProfile.length ? <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {data.capabilityProfile.map((item) => <article key={item.key} className="rounded-xl border border-[#E0E7E3] p-4">
        <div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-semibold">{item.label}</span><span>{item.interviewSamples ? `${item.score} 分` : '待积累'} · {item.confidence ? confidence[item.confidence] : '低置信度'}</span></div>
        <div className="h-2 rounded-full bg-[#E4EAE7]"><div className="h-full rounded-full bg-[#176B52]" style={{ width: `${item.interviewSamples ? item.score : 0}%` }}/></div>
        <p className="mt-2 text-xs text-[#718079]">{item.interviewSamples} 场面试 · {item.evidenceCount} 道题证据</p>
        {item.evidence?.length ? <details className="mt-3"><summary className="cursor-pointer text-xs font-medium text-[#176B52]">查看评价证据（{item.evidence.length}）</summary>
          <div className="mt-2 space-y-2">{item.evidence.map((evidence, index) => <div key={`${evidence.interviewId}-${index}`} className="rounded-lg bg-[#F4F7F6] p-3 text-xs leading-5 text-[#52615B]">
            <p className="font-medium text-[#26332E]">{evidence.rationale}</p>
            {evidence.answerExcerpt && <p className="mt-1 text-[#66736D]">回答摘录：“{evidence.answerExcerpt}”</p>}
            <Link className="mt-1 inline-block text-[#176B52] hover:underline" to={`/interviews/results/${evidence.interviewId}`}>{evidence.position} · 查看本场报告</Link>
          </div>)}</div>
        </details> : <p className="mt-3 text-xs text-[#8A9691]">暂无可回溯证据，新版面试完成后自动补充。</p>}
      </article>)}
    </div> : <div className="mt-6 rounded-lg bg-[#F4F7F6] p-5 text-sm text-[#66736D]">至少完成 {data.capabilityMinimumSamples} 场正式评价后生成长期能力画像。单场结果仍可在面试记录中查看。</div>}
  </section>;
}
