import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { jobApi } from '@/api/job.api';
import { resumeApi } from '@/api/home.api';
import { notification } from '@/components/common/Notification';
import type { Resume } from '@/types/resume';
import type { JobMatchAnalysis, JobMatchOptimizationResult } from '@/types/job';
import { getApiErrorMessage } from '@/utils/api-error';

export default function JobMatchOptimizationPanel({
  jobId,
  resumeId,
  analysisId,
  requirementIndex,
  onResumeChanged,
}: {
  jobId: string;
  resumeId: string;
  analysisId: string;
  requirementIndex: number;
  onResumeChanged: (resume: Resume) => void;
}) {
  const [facts, setFacts] = useState('');
  const [result, setResult] = useState<JobMatchOptimizationResult | null>(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [versionId, setVersionId] = useState<string | null>(null);
  const [baseline, setBaseline] = useState<JobMatchAnalysis | null>(null);
  const [rematch, setRematch] = useState<JobMatchAnalysis | null>(null);
  const [rematching, setRematching] = useState(false);
  const [rematchFailed, setRematchFailed] = useState(false);

  useEffect(() => {
    void jobApi.getLatestMatch(jobId, resumeId).then((response) => {
      if (response.code !== 200 || !response.data || response.data.id !== analysisId || response.data.stale) {
        throw new Error('岗位匹配报告已过期');
      }
      setBaseline(response.data);
    }).catch((cause) => notification.error(getApiErrorMessage(cause, '岗位匹配报告加载失败')));
  }, [jobId, resumeId, analysisId]);

  const generate = async () => {
    setLoading(true);
    try {
      const response = await jobApi.optimizeMatchRequirement(jobId, { analysisId, requirementIndex, userFacts: facts });
      if (response.code !== 200) throw new Error(response.message);
      setResult(response.data);
      setDraft(response.data.mode === 'suggestion' ? response.data.suggestedText : '');
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '岗位匹配优化建议生成失败'));
    } finally {
      setLoading(false);
    }
  };

  const rerunMatch = async () => {
    setRematching(true);
    setRematchFailed(false);
    try {
      const response = await jobApi.analyzeMatch(jobId, resumeId);
      if (response.code !== 200) throw new Error(response.message);
      setRematch(response.data);
    } catch (cause) {
      setRematchFailed(true);
      notification.error(getApiErrorMessage(cause, '建议已应用，但重新匹配失败'));
    } finally {
      setRematching(false);
    }
  };

  const apply = async () => {
    if (!draft.trim()) return notification.error('建议文本不能为空');
    setLoading(true);
    try {
      const response = await jobApi.applyMatchOptimization(jobId, { analysisId, requirementIndex, suggestedText: draft.trim() });
      if (response.code !== 200) throw new Error(response.message);
      setVersionId(response.data.versionId);
      onResumeChanged(response.data.resume);
      notification.success('岗位匹配建议已应用，并已创建版本快照');
      void rerunMatch();
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '应用建议失败'));
    } finally {
      setLoading(false);
    }
  };

  const restore = async () => {
    if (!versionId) return;
    setLoading(true);
    try {
      const response = await resumeApi.restoreVersion(resumeId, versionId);
      if (response.code !== 200) throw new Error(response.message);
      onResumeChanged(response.data);
      setVersionId(null);
      setRematch(null);
      setRematchFailed(false);
      notification.success('已恢复应用前版本');
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '恢复版本失败'));
    } finally {
      setLoading(false);
    }
  };

  const baselineRequirement = baseline?.requirements[requirementIndex];
  const rematchedRequirement = baselineRequirement
    ? rematch?.requirements.find((item) => item.requirementId === baselineRequirement.requirementId)
    : null;
  const scoreDelta = baseline && rematch ? rematch.score - baseline.score : null;

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="border-b p-4">
        <div className="flex items-center gap-2"><Sparkles size={18} className="text-violet-600" /><h2 className="font-semibold">岗位证据优化</h2></div>
        <p className="mt-1 text-xs text-gray-500">JD 只用于确定表达重点，不会被当作你的真实经历。</p>
      </header>
      <div className="flex-1 space-y-4 overflow-auto p-4">
        {result && <section className="rounded-lg border border-amber-200 bg-amber-50 p-3"><div className="flex gap-2 text-sm font-medium text-amber-800"><AlertCircle size={16} />{result.requirementName}</div><p className="mt-2 text-xs text-amber-700">JD 证据：{result.jdEvidence}</p><blockquote className="mt-2 border-l-2 border-amber-300 pl-3 text-sm text-gray-700">{result.originalText}</blockquote></section>}
        {result?.mode === 'needs_input' && <ul className="list-disc space-y-1 rounded-lg border p-3 pl-8 text-sm text-gray-600">{result.questions.map((question) => <li key={question}>{question}</li>)}</ul>}
        <label className="block text-sm font-medium text-gray-700">补充你的真实使用事实<textarea value={facts} onChange={(event) => setFacts(event.target.value)} className="mt-2 min-h-28 w-full rounded-lg border p-3 text-sm" placeholder="说明实际场景、行动与可确认结果；没有的事实不要填写。" /></label>
        <button disabled={loading || Boolean(versionId)} onClick={() => void generate()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}生成岗位定向建议</button>
        {result?.mode === 'suggestion' && <section className="space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4">
          <label className="block text-xs font-medium text-violet-700">建议文本（可调整）<textarea value={draft} disabled={Boolean(versionId)} onChange={(event) => setDraft(event.target.value)} className="mt-2 min-h-32 w-full rounded-lg border bg-white p-3 text-sm font-normal text-gray-900 disabled:bg-gray-100" /></label>
          <p className="text-sm text-gray-700">{result.reason}</p>
          {versionId ? <div className="space-y-3 rounded border border-emerald-200 bg-white p-3"><div className="flex items-center justify-between"><span className="flex items-center gap-1 text-xs text-emerald-700"><Check size={14} />已应用并创建快照</span><button disabled={loading} onClick={() => void restore()} className="flex items-center gap-1 text-sm text-emerald-700"><RotateCcw size={14} />撤销应用</button></div>
            {rematching && <p className="flex items-center gap-2 text-xs text-gray-600"><Loader2 size={14} className="animate-spin" />正在基于当前岗位画像重新匹配…</p>}
            {rematchFailed && !rematching && <div className="flex items-center justify-between rounded border border-amber-200 p-2"><span className="text-xs text-amber-700">重新匹配失败，不影响已应用内容。</span><button onClick={() => void rerunMatch()} className="text-xs font-medium text-violet-700">重试匹配</button></div>}
            {rematch && !rematching && <div className="rounded border border-emerald-200 p-3"><p className="text-xs font-medium text-gray-500">重新匹配结果</p><div className="mt-2 flex items-end gap-2"><span className="text-2xl font-semibold">{rematch.score}</span>{baseline && <span className="pb-1 text-xs text-gray-500">原 {baseline.score} 分</span>}{scoreDelta !== null && <span className={`pb-1 text-xs font-medium ${scoreDelta > 0 ? 'text-emerald-700' : scoreDelta < 0 ? 'text-red-600' : 'text-gray-500'}`}>{scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}</span>}</div><p className={`mt-2 text-xs ${rematchedRequirement?.status === 'matched' ? 'text-emerald-700' : 'text-amber-700'}`}>{rematchedRequirement?.status === 'matched' ? '该岗位要求已转为“已匹配”。' : rematchedRequirement ? `该岗位要求当前仍为“${rematchedRequirement.status === 'insufficient_evidence' ? '证据不足' : rematchedRequirement.status === 'gap' ? '能力缺口' : '待确认'}”。` : '新报告中未找到对应岗位要求，请返回岗位页核对。'}</p></div>}
          </div> : <button disabled={loading} onClick={() => void apply()} className="flex items-center gap-1 rounded bg-violet-600 px-3 py-2 text-sm text-white"><Check size={15} />应用建议</button>}
        </section>}
      </div>
    </div>
  );
}
