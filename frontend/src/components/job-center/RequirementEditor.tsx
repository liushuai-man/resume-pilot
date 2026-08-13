import { X } from 'lucide-react';
import type { JobRequirement } from '@/types/job';

const emptyRequirement = (): JobRequirement => ({
  name: '',
  evidence: '',
  confidence: 1,
});

interface RequirementEditorProps {
  title: string;
  value: JobRequirement[];
  disabled: boolean;
  onChange: (next: JobRequirement[]) => void;
}

export default function RequirementEditor({
  title,
  value,
  disabled,
  onChange,
}: RequirementEditorProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {!disabled && (
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => onChange([...value, emptyRequirement()])}
          >
            + 添加
          </button>
        )}
      </div>
      {value.length === 0 && (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-400">
          未识别到相关内容
        </p>
      )}
      {value.map((item, index) => (
        <div
          key={index}
          className={`rounded-lg border p-3 ${
            item.confidence < 0.7
              ? 'border-amber-300 bg-amber-50/50'
              : 'border-gray-200'
          }`}
        >
          <div className="flex gap-2">
            <input
              value={item.name}
              disabled={disabled}
              onChange={(event) => {
                const next = [...value];
                next[index] = { ...item, name: event.target.value };
                onChange(next);
              }}
              className="min-w-0 flex-1 rounded border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
              placeholder="要求摘要"
            />
            {!disabled && (
              <button
                type="button"
                aria-label="删除"
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={17} />
              </button>
            )}
          </div>
          <textarea
            value={item.evidence}
            disabled={disabled}
            onChange={(event) => {
              const next = [...value];
              next[index] = { ...item, evidence: event.target.value };
              onChange(next);
            }}
            className="mt-2 min-h-16 w-full resize-y rounded border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:bg-gray-50"
            placeholder="对应的 JD 原文证据"
          />
          <p className={`mt-1 text-xs ${
            item.confidence < 0.7 ? 'font-medium text-amber-700' : 'text-gray-400'
          }`}>
            原始 AI 置信度 {Math.round(item.confidence * 100)}%
            {item.confidence < 0.7 ? ' · 需要重点确认' : ''}
          </p>
        </div>
      ))}
    </section>
  );
}
