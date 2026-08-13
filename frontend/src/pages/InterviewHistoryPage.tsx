import { Button, Loader, Stack, Text } from '@mantine/core';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';
import InterviewHistoryCard from '@/components/interview/InterviewHistoryCard';
import { useInterviewHistory } from '@/hooks/useInterviewHistory';

export default function InterviewHistoryPage() {
  const navigate = useNavigate();
  const history = useInterviewHistory();
  if (history.loading) return <div className="flex min-h-[480px] items-center justify-center"><Loader size="xl"/></div>;
  return <div className="mx-auto max-w-7xl px-6 py-2">
    <PageHeader eyebrow="INTERVIEW HISTORY" title="面试记录" description="查看每一次模拟面试及最终报告。生成中的任务会自动更新状态。" action={<button onClick={() => navigate('/interviews')} className="inline-flex items-center gap-2 rounded-lg bg-[#176B52] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#115640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/35">开始面试</button>}/>
    <div className="mx-auto mt-6 max-w-4xl">{history.results.length === 0
      ? <div className="flex flex-col items-center justify-center py-20"><FileText size={48} className="mb-4 text-gray-300"/><Text c="dimmed" size="lg">暂无面试记录</Text><Button variant="outline" mt="md" onClick={() => navigate('/interviews')}>开始面试</Button></div>
      : <Stack gap="md">{history.results.map((result) => <InterviewHistoryCard key={result.id} result={result} retrying={history.retryingId === result.id} onOpen={() => navigate(`/interviews/results/${result.id}`)} onRetry={() => history.retry(result)} onDelete={() => history.remove(result.id)}/>)}</Stack>}
    </div>
  </div>;
}
