import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ContentQualityAnalysis } from '@/types/content-quality';

export default function ContentQualityPanel({ result }: { result: ContentQualityAnalysis | null }) {
  if (!result) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center">
        <Sparkles size={30} className="text-gray-300" />
        <p className="mt-3 font-medium text-gray-700">尚未运行内容质量评价</p>
        <p className="mt-1 text-sm text-gray-400">使用默认模型检查连贯性、信息有效性、证据具体性、一致性与专业性。</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-5">
      <aside className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-center"><span className="text-4xl font-bold text-blue-600">{result.score}</span><span className="text-gray-400"> / 100</span><p className="mt-2 font-semibold text-gray-800">内容质量分</p></div>
        <div className="mt-5 space-y-3">
          {result.dimensions.map((dimension) => (
            <div key={dimension.key}>
              <div className="flex justify-between text-xs text-gray-500"><span>{dimension.key}</span><span>{dimension.score}/{dimension.maxScore}</span></div>
              <div className="mt-1 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${dimension.score / dimension.maxScore * 100}%` }} /></div>
              <p className="mt-1 text-xs leading-5 text-gray-400">{dimension.reason}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t pt-3 text-xs leading-5 text-gray-400">{result.modelName} · {result.promptVersion}<br />整体置信度 {Math.round(result.overallConfidence * 100)}%</p>
      </aside>
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div><h3 className="font-semibold text-gray-900">字段级语义问题</h3><p className="mt-1 text-sm text-gray-500">低于 70% 置信度的结论只标记为待确认。</p></div>
          {result.stale && <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">简历已修改，报告已过期</span>}
        </div>
        <div className="mt-4 max-h-[520px] space-y-3 overflow-auto pr-1">
          {result.issues.map((issue, index) => (
            <article key={`${issue.fieldId}-${index}`} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs ${issue.status === 'needs_confirmation' ? 'bg-amber-50 text-amber-700' : issue.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{issue.status === 'needs_confirmation' ? '待确认' : issue.severity === 'error' ? '严重' : issue.severity === 'warning' ? '警告' : '建议'}</span>
                <span className="text-xs text-gray-400">置信度 {Math.round(issue.confidence * 100)}%</span>
              </div>
              <blockquote className="mt-3 border-l-2 border-gray-200 pl-3 text-sm text-gray-600">{issue.evidence}</blockquote>
              <p className="mt-3 text-sm leading-6 text-gray-700">{issue.reason}</p>
              <p className="mt-1 text-sm leading-6 text-blue-700">建议：{issue.suggestion}</p>
              <Link to={`/resumes/${result.resumeId}/edit?section=${encodeURIComponent(issue.section)}&itemId=${encodeURIComponent(issue.itemId || '')}&field=${encodeURIComponent(issue.field)}&analysisId=${encodeURIComponent(result.id)}&qualityIssue=${index}`} className="mt-3 inline-flex text-xs font-medium text-blue-600">定位并优化</Link>
            </article>
          ))}
          {result.issues.length === 0 && <div className="rounded-lg bg-green-50 p-8 text-center text-sm text-green-700">模型未发现明确的内容质量问题。</div>}
        </div>
      </section>
    </div>
  );
}
