import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Loader, Text, Title } from '@mantine/core';
import { CircleAlert, RefreshCw } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { interviewApi, type InterviewResult } from '@/api/interview.api';
import InterviewPipelineStatus, { interviewNodeLabel } from '@/components/interview/InterviewPipelineStatus';
import InterviewReportOverview from '@/components/interview/InterviewReportOverview';
import InterviewReportSummary from '@/components/interview/InterviewReportSummary';
import { formatDateTime } from '@/utils/format';
import { useUserStore } from '@/store/useUserStore';
import { guestWorkspace } from '@/services/guest-workspace';

export default function InterviewResultPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [retrying, setRetrying] = useState(false);
  const isGuest = useUserStore((state) => state.isGuest);

  useEffect(() => {
    if (!id) return;
    const loadResult = isGuest
      ? guestWorkspace.listInterviewResults().then((items) => items.find((item) => item.id === id) || null)
      : interviewApi.getInterviewResult(id);
    loadResult.then(setResult)
      .catch(() => notifications.show({ title: '错误', message: '获取面试结果失败', color: 'red' }))
      .finally(() => setLoading(false));
  }, [id, isGuest]);

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader size="xl" color="#176B52"/></div>;
  if (!result) return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4"><Text c="dimmed">未找到面试结果</Text><Button variant="outline" onClick={() => navigate('/interviews/history')}>查看面试记录</Button></div>;

  if (result.status === 'generating') return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center"><Loader size="lg" color="#176B52"/><Title order={3}>报告生成中</Title><Text c="dimmed">当前步骤：{interviewNodeLabel(result.current_node)}。完整问答已保存。</Text><InterviewPipelineStatus result={result}/><Button variant="outline" onClick={() => window.location.reload()}>刷新状态</Button></div>;

  if (result.status === 'failed') return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center"><CircleAlert size={40} className="text-red-500"/><Title order={3}>报告生成失败</Title><Text c="dimmed">“{interviewNodeLabel(result.failed_node)}”未完成，完整问题和回答已经保存。</Text><InterviewPipelineStatus result={result}/><Button leftSection={<RefreshCw size={16}/>} loading={retrying} onClick={async () => {
    setRetrying(true);
    try {
      const updated = result.failed_node && result.evaluation_input_hash ? await interviewApi.retryInterviewNode(result.id, result.failed_node, result.evaluation_input_hash) : await interviewApi.retryInterviewReport(result.id);
      setResult(updated);
      if (updated.status !== 'completed') notifications.show({ title: '仍未生成', message: '请稍后再次重试', color: 'red' });
    } catch { notifications.show({ title: '重试失败', message: '问答记录仍已安全保存', color: 'red' }); }
    finally { setRetrying(false); }
  }}>重新执行：{interviewNodeLabel(result.failed_node)}</Button></div>;

  if (!result.report) return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4"><CircleAlert size={36} className="text-amber-500"/><Title order={3}>报告数据不完整</Title><Text c="dimmed">没有找到可验证的正式评价数据，不展示推导分数。</Text><Button variant="outline" onClick={() => navigate('/interviews/history')}>返回面试记录</Button></div>;

  return <main className="mx-auto max-w-3xl px-5 py-8 text-[#17211D]">
    <InterviewReportOverview report={result.report} position={result.position} date={formatDateTime(result.created_at)}/>
    <InterviewReportSummary report={result.report}/>
    <div className="flex justify-center gap-3 border-t border-slate-200 pt-8"><Button variant="outline" onClick={() => navigate('/interviews')}>重新面试</Button><Button onClick={() => navigate('/resumes')}>返回我的简历</Button></div>
  </main>;
}
