import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { JobMatchAnalysis } from '@/types/job';

export default function JobMatchPanel({ result }: { result: JobMatchAnalysis | null }) {
  if (!result) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center">
        <BarChart3 size={30} className="text-gray-300" />
        <p className="mt-3 font-medium text-gray-700">尚未运行岗位匹配</p>
        <p className="mt-1 text-sm text-gray-400">只使用当前已确认岗位画像与所选简历。</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-5">
      <aside className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-center"><span className="text-4xl font-bold text-violet-600">{result.score}</span><span className="text-gray-400"> / 100</span><p className="mt-2 font-semibold">岗位匹配分</p><p className="mt-1 text-xs text-gray-400">岗位画像 V{result.jobProfileVersion}</p></div>
        <div className="mt-5 space-y-3">{result.dimensions.map((dimension) => <div key={dimension.key}><div className="flex justify-between text-xs text-gray-500"><span>{dimension.key}</span><span>{dimension.score}/{dimension.maxScore}</span></div><div className="mt-1 h-1.5 rounded bg-gray-100"><div className="h-full rounded bg-violet-500" style={{ width: `${dimension.score / dimension.maxScore * 100}%` }} /></div><p className="mt-1 text-xs text-gray-400">{dimension.reason}</p></div>)}</div>
        <p className="mt-4 border-t pt-3 text-xs text-gray-400">{result.modelName} · {result.promptVersion}<br />整体置信度 {Math.round(result.overallConfidence * 100)}%</p>
      </aside>
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex justify-between"><div><h3 className="font-semibold">岗位要求逐项匹配</h3><p className="mt-1 text-sm text-gray-500">结论与 ATS、内容质量分开。</p></div>{result.stale && <span className="h-fit rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">报告已过期</span>}</div>
        <div className="mt-4 max-h-[520px] space-y-3 overflow-auto">
          {result.requirements.map((item, index) => (
            <article key={item.requirementId} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center gap-2"><span className="font-medium text-gray-800">{item.requirementName}</span><span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{item.category === 'responsibility' ? '岗位职责' : item.category === 'required_skill' ? '必备能力' : '加分项'}</span><span className={`rounded px-2 py-0.5 text-xs ${item.status === 'matched' ? 'bg-green-50 text-green-700' : item.status === 'gap' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.status === 'matched' ? '已匹配' : item.status === 'insufficient_evidence' ? '证据不足' : item.status === 'gap' ? '能力缺口' : '待确认'}</span><span className="text-xs text-gray-400">置信度 {Math.round(item.confidence * 100)}%</span></div>
              <p className="mt-2 text-xs text-gray-400">JD 证据：{item.jdEvidence}</p>
              {item.resumeEvidence && <blockquote className="mt-3 border-l-2 pl-3 text-sm text-gray-600">{item.resumeEvidence}</blockquote>}
              <p className="mt-3 text-sm text-gray-700">{item.reason}</p>
              {item.status === 'insufficient_evidence' && item.section && !result.stale
                ? <Link to={`/resumes/${result.resumeId}/edit?section=${encodeURIComponent(item.section)}&itemId=${encodeURIComponent(item.itemId || '')}&field=${encodeURIComponent(item.field || '')}&matchJobId=${encodeURIComponent(result.jobDescriptionId)}&matchAnalysisId=${encodeURIComponent(result.id)}&matchRequirement=${index}`} className="mt-3 inline-flex text-xs font-medium text-violet-600">定位并优化</Link>
                : item.section && <Link to={`/resumes/${result.resumeId}/edit?section=${encodeURIComponent(item.section)}&itemId=${encodeURIComponent(item.itemId || '')}&field=${encodeURIComponent(item.field || '')}`} className="mt-3 inline-flex text-xs font-medium text-blue-600">查看简历证据</Link>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
