import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Container, Loader, Select, Text } from '@mantine/core';
import { ArrowLeft, CheckCircle2, History, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { resumeApi, type ResumeOptimizationHistoryItem } from '@/api/home.api';
import ConfirmModal from '@/components/common/ConfirmModal';
import PageHeader from '@/components/common/PageHeader';
import { notification } from '@/components/common/Notification';
import { getApiErrorMessage } from '@/utils/api-error';
import { formatDateTime } from '@/utils/format';

const sourceLabels: Record<ResumeOptimizationHistoryItem['source'], string> = {
  content_quality: '内容质量',
  job_match: '岗位匹配',
  ats: 'ATS 结构',
};

const statusLabels: Record<ResumeOptimizationHistoryItem['status'], string> = {
  accepted: '已应用',
  rejected: '已拒绝',
  reverted: '已撤销',
};

const scoreChange = (item: ResumeOptimizationHistoryItem) => {
  if (item.scoreBefore === null || item.scoreAfter === null) return '暂无评分对比';
  const delta = item.scoreAfter - item.scoreBefore;
  return `${item.scoreBefore} → ${item.scoreAfter}（${delta >= 0 ? '+' : ''}${delta}）`;
};

export default function ResumeOptimizationHistoryPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<ResumeOptimizationHistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [pendingRevert, setPendingRevert] = useState<ResumeOptimizationHistoryItem | null>(null);

  const loadHistory = useCallback(async (cursor?: string) => {
    if (!id) return;
    cursor ? setLoadingMore(true) : setLoading(true);
    try {
      const response = await resumeApi.getOptimizationHistory(id, {
        status: status as ResumeOptimizationHistoryItem['status'] | undefined,
        source: source as ResumeOptimizationHistoryItem['source'] | undefined,
        cursor,
        limit: 20,
      });
      if (response.code !== 200) throw new Error(response.message);
      setItems((current) => cursor ? [...current, ...response.data.items] : response.data.items);
      setNextCursor(response.data.nextCursor);
    } catch (error) {
      notification.error(getApiErrorMessage(error, '优化历史加载失败'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id, source, status]);

  useEffect(() => { void loadHistory(); }, [loadHistory]);

  const confirmRevert = async () => {
    if (!pendingRevert || reverting) return;
    setReverting(true);
    try {
      const response = await resumeApi.revertOptimization(id, pendingRevert.id);
      if (response.code !== 200) throw new Error(response.message);
      setItems((current) => [response.data.revertAction, ...current.map((item) => item.id === pendingRevert.id ? response.data.action : item)]);
      setPendingRevert(null);
      notification.success('优化已撤销，简历内容已恢复');
    } catch (error) {
      notification.error(getApiErrorMessage(error, '撤销失败，请稍后重试'));
    } finally {
      setReverting(false);
    }
  };

  return (
    <Container className="mx-auto max-w-5xl px-6">
      <PageHeader
        eyebrow="OPTIMIZATION HISTORY"
        title="优化历史"
        description="查看 AI 修改的依据与效果，并在内容未被后续编辑时安全撤销。底层恢复快照由系统自动管理。"
        action={<Button variant="light" leftSection={<ArrowLeft size={16} />} onClick={() => navigate(`/resumes/${id}/edit`)}>返回编辑器</Button>}
      />

      <div className="mb-5 flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <Select clearable placeholder="全部来源" value={source} onChange={setSource} data={Object.entries(sourceLabels).map(([value, label]) => ({ value, label }))} className="w-40" />
        <Select clearable placeholder="全部状态" value={status} onChange={setStatus} data={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))} className="w-40" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader /></div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-20 text-center">
          <History className="mx-auto mb-3 text-gray-300" size={36} />
          <Text fw={600}>暂无优化记录</Text>
          <Text size="sm" c="dimmed" mt={6}>应用或拒绝 AI 建议后，记录会显示在这里。</Text>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="light">{sourceLabels[item.source]}</Badge>
                  {item.actionType === 'revert' && <Badge color="violet">撤销事件</Badge>}
                  <Badge color={item.status === 'accepted' ? 'green' : item.status === 'reverted' ? 'gray' : 'orange'}>{statusLabels[item.status]}</Badge>
                  {item.resolved === true && <Badge color="teal" leftSection={<CheckCircle2 size={12} />}>问题已解决</Badge>}
                </div>
                <Text size="xs" c="dimmed">{formatDateTime(item.createdAt)}</Text>
              </div>
              <Text size="xs" c="dimmed" mt="md">字段：{item.fieldId}</Text>
              {(item.reason || item.evidence) && <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3"><Text size="xs" fw={600} c="blue">修改原因与依据</Text>{item.reason && <Text size="sm" mt={6}>{item.reason}</Text>}{item.evidence && item.evidence !== item.originalText && <Text size="xs" c="dimmed" mt={6}>依据：{item.evidence}</Text>}</div>}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-red-50 p-3"><Text size="xs" fw={600} c="red">修改前</Text><Text size="sm" mt={6} className="whitespace-pre-wrap">{item.originalText}</Text></div>
                <div className="rounded-lg bg-green-50 p-3"><Text size="xs" fw={600} c="green">修改后</Text><Text size="sm" mt={6} className="whitespace-pre-wrap">{item.finalText}</Text></div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <Text size="sm" c="dimmed">评分：{scoreChange(item)}</Text>
                {item.canRevert && <Button size="xs" variant="outline" color="red" leftSection={<RotateCcw size={14} />} onClick={() => setPendingRevert(item)}>撤销此优化</Button>}
              </div>
            </article>
          ))}
          {nextCursor && <div className="flex justify-center pt-2"><Button variant="light" loading={loadingMore} onClick={() => void loadHistory(nextCursor)}>加载更多</Button></div>}
        </div>
      )}

      <ConfirmModal opened={Boolean(pendingRevert)} onClose={() => !reverting && setPendingRevert(null)} title="撤销这次优化？" message="系统只会恢复这次优化对应的字段。如果该字段之后被编辑过，撤销会被安全阻止。" confirmText={reverting ? '撤销中…' : '确认撤销'} onConfirm={() => void confirmRevert()} type="warning" />
    </Container>
  );
}
