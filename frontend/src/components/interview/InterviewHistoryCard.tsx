import { Badge, Button, Card, Group, RingProgress, Text } from '@mantine/core';
import { Calendar, ChevronRight, CircleAlert, Clock3, FileText, RefreshCw, Trash2 } from 'lucide-react';
import type { InterviewResult } from '@/api/interview.api';
import { formatDateTime } from '@/utils/format';
import { interviewNodeLabel } from './InterviewPipelineStatus';

const scoreColor = (score: number) => score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red';
const scoreLabel = (score: number) => score >= 90 ? '优秀' : score >= 70 ? '良好' : score >= 60 ? '及格' : '需改进';

interface Props { result: InterviewResult; retrying: boolean; onOpen: () => void; onRetry: () => void; onDelete: () => void; }

export default function InterviewHistoryCard({ result, retrying, onOpen, onRetry, onDelete }: Props) {
  const completed = result.status === 'completed';
  return <Card shadow="sm" padding="lg" radius="md" withBorder className="cursor-pointer transition-shadow hover:shadow-md" onClick={onOpen}>
    <div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-4">
      {completed ? <RingProgress size={64} thickness={6} sections={[{ value: result.score, color: scoreColor(result.score) }]} label={<Text ta="center" fw={700} size="sm">{result.score}</Text>}/>
        : <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${result.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{result.status === 'failed' ? <CircleAlert size={24}/> : <Clock3 size={24}/>}</div>}
      <div className="min-w-0"><Group gap="sm" mb={4}><Text fw={600} truncate>{result.position || '面试评估'}</Text><Badge color={result.status === 'generating' ? 'yellow' : result.status === 'failed' ? 'red' : scoreColor(result.score)} variant="light" size="sm">{result.status === 'failed' ? '生成失败' : result.status === 'generating' ? '生成中' : scoreLabel(result.score)}</Badge></Group>
        <div className="flex flex-wrap gap-x-4 gap-y-1">{!completed && <Text size="xs" c={result.status === 'failed' ? 'red' : 'dimmed'}>{result.status === 'failed' ? '失败步骤' : '当前步骤'}：{interviewNodeLabel(result.failed_node || result.current_node)}</Text>}{result.resume && <span className="flex items-center gap-1"><FileText size={12} className="text-gray-400"/><Text size="xs" c="dimmed">{result.resume.title}</Text></span>}<span className="flex items-center gap-1"><Calendar size={12} className="text-gray-400"/><Text size="xs" c="dimmed">{formatDateTime(result.created_at)}</Text></span></div>
      </div></div>
      <div className="flex shrink-0 items-center gap-2">{result.status === 'failed' && <Button size="xs" variant="light" leftSection={<RefreshCw size={14}/>} loading={retrying} onClick={(event) => { event.stopPropagation(); onRetry(); }}>重新执行：{interviewNodeLabel(result.failed_node)}</Button>}<button type="button" onClick={(event) => { event.stopPropagation(); onDelete(); }} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" aria-label="删除面试记录"><Trash2 size={16}/></button><ChevronRight size={20} className="text-gray-400"/></div>
    </div>
  </Card>;
}
