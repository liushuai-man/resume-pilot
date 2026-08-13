import { Loader, Stack, Text } from '@mantine/core';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterviewHistoryCard from '@/components/interview/InterviewHistoryCard';
import { useInterviewHistory } from '@/hooks/useInterviewHistory';

export default function InterviewHistoryPage() {
  const navigate = useNavigate();
  const history = useInterviewHistory();
  if (history.loading) return <div className="flex min-h-[480px] items-center justify-center"><Loader size="xl"/></div>;
  return <>
    <div className="mb-5 min-h-12 border-b border-[#D8E1DD] pb-4"><p className="text-sm text-[#66736D]">查看每一次模拟面试及最终报告，生成中的任务会自动更新状态。</p></div>
    <div className="mx-auto max-w-4xl">{history.results.length === 0
      ? <div className="flex flex-col items-center justify-center py-20"><FileText size={48} className="mb-4 text-gray-300"/><Text c="dimmed" size="lg">暂无面试记录</Text></div>
      : <Stack gap="md">{history.results.map((result) => <InterviewHistoryCard key={result.id} result={result} retrying={history.retryingId === result.id} onOpen={() => navigate(`/interviews/results/${result.id}`)} onRetry={() => history.retry(result)} onDelete={() => history.remove(result.id)}/>)}</Stack>}
    </div>
  </>;
}
