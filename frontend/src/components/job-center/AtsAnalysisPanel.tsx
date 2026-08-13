import { AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AtsAnalysisResult } from '@/types/job';

interface AtsAnalysisPanelProps {
  result: AtsAnalysisResult | null;
}

export default function AtsAnalysisPanel({ result }: AtsAnalysisPanelProps) {
  if (!result) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center">
        <FileText size={30} className="text-gray-300" />
        <p className="mt-3 font-medium text-gray-700">选择简历后开始体检</p>
        <p className="mt-1 text-sm text-gray-400">将检查完整性、内容证据密度、可解析性、日期与内容表达。</p>
      </div>
    );
  }

  const scoreTone = result.score >= 80
    ? 'border-green-100 text-green-600'
    : result.score >= 60
      ? 'border-amber-100 text-amber-600'
      : 'border-red-100 text-red-600';

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <p className="font-medium">本次结果的评价边界</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-blue-700">
          {result.limitations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5">
        <aside className="rounded-xl border border-gray-200 p-5 text-center">
          <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[10px] ${scoreTone}`}>
            <span className="text-4xl font-bold">{result.score}</span>
          </div>
          <p className="mt-3 font-semibold text-gray-800">ATS 结构分</p>
          <p className="mt-1 text-xs text-gray-400">{result.scorerVersion}</p>
          <div className="mt-5 space-y-2 text-left">
            {result.dimensions.map((dimension) => (
              <div key={dimension.key}>
                <div className="flex justify-between text-xs text-gray-500"><span>{dimension.label}</span><span>{dimension.score}/{dimension.maxScore}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${dimension.maxScore ? dimension.score / dimension.maxScore * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
            <div><strong className="block text-base text-red-600">{result.summary.errors}</strong>严重</div>
            <div><strong className="block text-base text-amber-600">{result.summary.warnings}</strong>警告</div>
            <div><strong className="block text-base text-blue-600">{result.summary.suggestions}</strong>建议</div>
          </div>
        </aside>
        <section className="min-w-0 rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900">可处理的问题</h3>
          <p className="mt-1 text-sm text-gray-500">优先补齐严重问题；每项都显示完善后还能获得的分数。</p>
          <div className="mt-4 max-h-[430px] space-y-3 overflow-auto pr-1">
            {result.issues.map((issue) => {
              const optimizable = ['basic', 'education', 'skills', 'objective'].includes(issue.section)
                && (Boolean(issue.itemId) || ['basic', 'objective'].includes(issue.section));
              const query = `section=${encodeURIComponent(issue.section)}&itemId=${encodeURIComponent(issue.itemId || '')}&field=${encodeURIComponent(issue.field)}${optimizable ? `&atsIssue=${encodeURIComponent(issue.id)}` : ''}`;
              return (
                <article key={issue.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <AlertCircle size={18} className={`mt-0.5 shrink-0 ${issue.severity === 'error' ? 'text-red-500' : issue.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
                      <div><p className="font-medium text-gray-800">{issue.title}</p><p className="mt-1 text-sm leading-6 text-gray-500">{issue.message}</p><p className="mt-2 text-xs text-gray-400">{issue.section} / {issue.itemId || '模块'} / {issue.field}</p></div>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${issue.availablePoints > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{issue.availablePoints > 0 ? `可得 +${issue.availablePoints}` : '必须修正'}</span>
                  </div>
                  <Link to={`/resumes/${result.resumeId}/edit?${query}`} className="mt-3 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700">{optimizable ? '定位并修正' : '编辑对应字段'}</Link>
                </article>
              );
            })}
            {result.issues.length === 0 && <div className="rounded-lg bg-green-50 p-8 text-center text-sm text-green-700">未发现 ATS 基础问题，下一步可以进行 JD 岗位匹配。</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
