import { Loader, Text } from '@mantine/core';
import { Check, CircleAlert, CircleDashed } from 'lucide-react';
import type { InterviewResult } from '@/api/interview.api';

const nodes = [
  ['transcript_validation', '校验完整问答'],
  ['batch_evaluation', '批量评价回答'],
  ['report_composition', '汇总面试报告'],
  ['report_publication', '保存最终报告'],
] as const;

export const interviewNodeLabel = (key?: string | null) => nodes.find(([node]) => node === key)?.[1] || '准备报告';

export default function InterviewPipelineStatus({ result }: { result: InterviewResult }) {
  const state = result.pipeline_state || {};
  return <div className="w-full max-w-md rounded-xl border border-[#D8E1DD] bg-white p-5 text-left shadow-sm">
    <Text fw={700}>报告处理进度</Text>
    <div className="mt-4 space-y-3">{nodes.map(([key, label]) => {
      const status = state[key] || (result.current_node === key ? result.status === 'failed' ? 'failed' : 'running' : 'pending');
      return <div key={key} className="flex items-center gap-3">
        {status === 'succeeded' ? <Check size={17} className="text-emerald-600"/>
          : status === 'failed' ? <CircleAlert size={17} className="text-red-500"/>
          : status === 'running' ? <Loader size="xs" color="teal"/>
          : <CircleDashed size={17} className="text-slate-300"/>}
        <Text size="sm" fw={status === 'running' || status === 'failed' ? 600 : 400} c={status === 'failed' ? 'red' : status === 'pending' ? 'dimmed' : undefined}>{label}</Text>
      </div>;
    })}</div>
  </div>;
}
