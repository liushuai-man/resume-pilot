import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { interviewApi, type InterviewResult } from '@/api/interview.api';
import { useUserStore } from '@/store/useUserStore';
import { guestWorkspace } from '@/services/guest-workspace';

const POLL_INTERVAL = 4000;

export function useInterviewHistory() {
  const isGuest = useUserStore((state) => state.isGuest);
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const refresh = useCallback(async (silent = false) => {
    try { setResults(isGuest ? await guestWorkspace.listInterviewResults() : await interviewApi.getInterviewResults()); }
    catch { if (!silent) notifications.show({ title: '加载失败', message: '暂时无法获取面试记录', color: 'red' }); }
    finally { if (!silent) setLoading(false); }
  }, [isGuest]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!results.some((item) => item.status === 'generating')) return;
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') refresh(true); }, POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [refresh, results]);

  const retry = async (result: InterviewResult) => {
    if (isGuest) return;
    setRetryingId(result.id);
    try {
      const updated = result.failed_node && result.evaluation_input_hash
        ? await interviewApi.retryInterviewNode(result.id, result.failed_node, result.evaluation_input_hash)
        : await interviewApi.retryInterviewReport(result.id);
      setResults((items) => items.map((item) => item.id === result.id ? updated : item));
      notifications.show(updated.status === 'completed'
        ? { title: '报告已生成', message: '现在可以查看完整评价', color: 'green' }
        : { title: '生成仍未完成', message: '问答记录已保留，可稍后继续', color: 'red' });
    } catch { notifications.show({ title: '重试失败', message: '问答记录仍已安全保存', color: 'red' }); }
    finally { setRetryingId(null); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('确定要删除这条面试记录吗？')) return;
    try {
      if (isGuest) await guestWorkspace.deleteInterviewResult(id);
      else await interviewApi.deleteInterviewResult(id);
      setResults((items) => items.filter((item) => item.id !== id));
      notifications.show({ title: '已删除', message: '面试记录已删除', color: 'green' });
    } catch { notifications.show({ title: '删除失败', message: '面试记录没有被删除', color: 'red' }); }
  };

  return { results, loading, retryingId, retry, remove };
}
