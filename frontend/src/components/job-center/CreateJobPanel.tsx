import { Check, Loader2, X } from 'lucide-react';

export type CreateProgress = 'idle' | 'saving' | 'analyzing' | 'error';

interface CreateJobPanelProps {
  title: string;
  company: string;
  rawText: string;
  busy: boolean;
  savedJobId: string | null;
  progress: CreateProgress;
  error: string;
  onTitleChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onRawTextChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

function ProgressStep({
  done,
  failed,
  running,
  number,
  title,
  detail,
}: {
  done?: boolean;
  failed?: boolean;
  running?: boolean;
  number: number;
  title: string;
  detail: string;
}) {
  const tone = done
    ? 'bg-green-100 text-green-600'
    : failed
      ? 'bg-red-100 text-red-600'
      : running
        ? 'bg-blue-100 text-blue-600'
        : 'bg-gray-100 text-gray-400';
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tone}`}>
        {done ? <Check size={17} /> : failed ? <X size={17} /> : running
          ? <Loader2 size={17} className="animate-spin" />
          : <span className="text-sm">{number}</span>}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-800">{number}. {title}</p>
        <p className="text-xs text-gray-500">{detail}</p>
      </div>
    </div>
  );
}

export default function CreateJobPanel(props: CreateJobPanelProps) {
  const locked = props.busy || Boolean(props.savedJobId);
  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-xl font-bold">添加目标岗位</h2>
      <p className="mt-1 text-sm text-gray-500">
        粘贴完整 JD，系统会提取要求并保留原文证据。
      </p>
      {props.progress !== 'idle' && (
        <div className={`mt-5 rounded-xl border p-4 ${
          props.progress === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
        }`}>
          <div className="grid grid-cols-2 gap-4">
            <ProgressStep
              number={1}
              title="保存 JD"
              done={Boolean(props.savedJobId)}
              failed={props.progress === 'error' && !props.savedJobId}
              running={props.progress === 'saving'}
              detail={props.savedJobId ? '已保存' : props.progress === 'error'
                ? '保存失败' : '正在保存原文...'}
            />
            <ProgressStep
              number={2}
              title="生成岗位画像"
              failed={props.progress === 'error' && Boolean(props.savedJobId)}
              running={props.progress === 'analyzing'}
              detail={props.progress === 'analyzing' ? 'AI 正在分析职责和能力要求...'
                : props.progress === 'error' ? '分析未完成，可以重试' : '等待保存完成'}
            />
          </div>
          {props.error && (
            <p className="mt-3 border-t border-red-200 pt-3 text-sm text-red-700">
              {props.error}
            </p>
          )}
        </div>
      )}
      <div className="mt-5 grid grid-cols-2 gap-4">
        <input disabled={locked} value={props.title} onChange={(event) => props.onTitleChange(event.target.value)} placeholder="岗位名称（可选）" className="rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50" />
        <input disabled={locked} value={props.company} onChange={(event) => props.onCompanyChange(event.target.value)} placeholder="公司名称（可选）" className="rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50" />
      </div>
      <textarea disabled={locked} value={props.rawText} onChange={(event) => props.onRawTextChange(event.target.value)} placeholder="在这里粘贴 JD 原文..." className="mt-4 min-h-[420px] w-full resize-y rounded-lg border border-gray-200 p-4 leading-7 disabled:bg-gray-50" />
      <div className="mt-4 flex justify-end gap-3">
        <button disabled={props.busy} onClick={props.onCancel} className="rounded-lg border px-4 py-2 disabled:opacity-50">
          {props.savedJobId ? '查看已保存 JD' : '取消'}
        </button>
        <button disabled={props.busy} onClick={props.onSubmit} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {props.busy && <Loader2 size={16} className="animate-spin" />}
          {props.savedJobId ? '重新分析' : '保存并分析'}
        </button>
      </div>
    </div>
  );
}
