import { useEffect, useState } from 'react';
import { AlertCircle, Check, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import { resumeApi } from '@/api/home.api';
import { notification } from '@/components/common/Notification';
import type { ContentQualityIssue, ResumeOptimizationResult } from '@/types/content-quality';
import type { Resume } from '@/types/resume';
import { getApiErrorMessage } from '@/utils/api-error';

type ReviewDecision = 'reviewing' | 'accepted' | 'rejected' | null;

export default function ResumeOptimizationPanel({
  resumeId,
  analysisId,
  issueIndex,
  onResumeChanged,
}: {
  resumeId: string;
  analysisId: string;
  issueIndex: number;
  onResumeChanged: (resume: Resume) => void;
}) {
  const [issue, setIssue] = useState<ContentQualityIssue | null>(null);
  const [facts, setFacts] = useState('');
  const [result, setResult] = useState<ResumeOptimizationResult | null>(null);
  const [draftSuggestion, setDraftSuggestion] = useState('');
  const [decision, setDecision] = useState<ReviewDecision>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedVersionId, setAppliedVersionId] = useState<string | null>(null);

  useEffect(() => {
    void resumeApi
      .getLatestContentQuality(resumeId)
      .then((response) => {
        if (response.code !== 200 || !response.data || response.data.id !== analysisId) {
          throw new Error('该报告已不是最新版本');
        }
        setIssue(response.data.issues[issueIndex] || null);
      })
      .catch((cause) => notification.error(getApiErrorMessage(cause, '优化问题加载失败')));
  }, [resumeId, analysisId, issueIndex]);

  const generate = async () => {
    setLoading(true);
    try {
      const response = await resumeApi.optimizeContentIssue(resumeId, {
        analysisId,
        issueIndex,
        userFacts: facts,
      });
      if (response.code !== 200) throw new Error(response.message);

      setResult(response.data);
      if (response.data.mode === 'suggestion') {
        setDraftSuggestion(response.data.suggestedText);
        setDecision('reviewing');
      } else {
        setDraftSuggestion('');
        setDecision(null);
      }
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '优化建议生成失败'));
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async () => {
    const text = draftSuggestion.trim();
    if (!text) {
      notification.error('建议文本不能为空');
      return;
    }

    setApplying(true);
    try {
      const response = await resumeApi.applyContentOptimization(resumeId, {
        analysisId,
        issueIndex,
        suggestedText: text,
      });
      if (response.code !== 200) throw new Error(response.message);
      setDecision('accepted');
      setAppliedVersionId(response.data.versionId);
      onResumeChanged(response.data.resume);
      notification.success('建议已应用，并已创建可恢复版本');
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '应用建议失败'));
    } finally {
      setApplying(false);
    }
  };

  const restoreVersion = async () => {
    if (!appliedVersionId) return;
    setApplying(true);
    try {
      const response = await resumeApi.restoreVersion(resumeId, appliedVersionId);
      if (response.code !== 200) throw new Error(response.message);
      onResumeChanged(response.data);
      setAppliedVersionId(null);
      setDecision('reviewing');
      notification.success('已恢复应用建议前的简历版本');
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '恢复版本失败'));
    } finally {
      setApplying(false);
    }
  };

  if (!issue) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-400">正在加载诊断问题…</div>;
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="border-b p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-violet-600" />
          <h2 className="font-semibold">诊断与建议</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">本轮只生成和审阅建议，不会自动修改简历。</p>
      </header>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex gap-2 text-sm font-medium text-amber-800">
            <AlertCircle size={16} />
            {issue.reason}
          </div>
          <blockquote className="mt-2 border-l-2 border-amber-300 pl-3 text-sm text-gray-700">
            {issue.evidence}
          </blockquote>
          <p className="mt-2 text-xs text-amber-700">建议方向：{issue.suggestion}</p>
        </section>

        {result?.mode === 'needs_input' && (
          <section className="rounded-lg border p-3">
            <h3 className="text-sm font-semibold">生成建议前需要你的事实</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
              {result.questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </section>
        )}

        <label className="block text-sm font-medium text-gray-700">
          补充真实事实（可选）
          <textarea
            value={facts}
            onChange={(event) => setFacts(event.target.value)}
            className="mt-2 min-h-28 w-full rounded-lg border p-3 text-sm"
            placeholder="例如：使用 Redis 缓存，将接口 P95 从 400ms 降至 180ms。没有的数据不要填写。"
          />
        </label>

        <button
          disabled={loading}
          onClick={generate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          生成局部建议
        </button>

        {result?.mode === 'suggestion' && (
          <section className="space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">修改前</p>
              <p className="mt-1 text-sm text-gray-700">{result.originalText}</p>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-violet-600">建议文本（可手动调整）</span>
              <textarea
                value={draftSuggestion}
                onChange={(event) => {
                  setDraftSuggestion(event.target.value);
                  setDecision('reviewing');
                }}
                disabled={decision === 'rejected'}
                className="mt-1 min-h-32 w-full rounded-lg border border-violet-200 bg-white p-3 text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </label>

            <div>
              <p className="text-xs font-medium text-gray-500">修改理由</p>
              <p className="mt-1 text-sm text-gray-700">{result.reason}</p>
            </div>

            {decision === 'rejected' ? (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <X size={16} />已拒绝本条建议
                </span>
                <button
                  onClick={() => setDecision('reviewing')}
                  className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm text-gray-700"
                >
                  <RotateCcw size={14} />恢复审阅
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  disabled={applying || decision === 'accepted'}
                  onClick={() => void applySuggestion()}
                  className="flex items-center gap-1 rounded bg-violet-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                >
                  {applying ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}应用建议
                </button>
                <button
                  disabled={decision === 'accepted'}
                  onClick={() => setDecision('rejected')}
                  className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 disabled:opacity-50"
                >
                  <X size={15} />拒绝建议
                </button>
                {draftSuggestion !== result.suggestedText && (
                  <button
                    onClick={() => {
                      setDraftSuggestion(result.suggestedText);
                      setDecision('reviewing');
                    }}
                    className="flex items-center gap-1 rounded border border-violet-300 bg-white px-3 py-2 text-sm text-violet-700"
                  >
                    <RotateCcw size={14} />恢复 AI 原文
                  </button>
                )}
              </div>
            )}

            {decision === 'accepted' && (
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="flex items-center gap-1 text-xs text-emerald-700"><Check size={14} />建议已应用，原简历已保存为版本快照。</p>
                {appliedVersionId && <button disabled={applying} onClick={() => void restoreVersion()} className="flex items-center gap-1 rounded border border-emerald-300 bg-white px-3 py-1.5 text-sm text-emerald-700 disabled:opacity-50"><RotateCcw size={14} />撤销应用</button>}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
