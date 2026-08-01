import {
  Button,
  Text,
  Paper,
  Group,
  RingProgress,
  Loader,
} from '@mantine/core';
import {
  Trophy,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import type { Question, Answer } from '@/api/interview.api';
import MarkdownContent from '@/components/common/MarkdownContent';

interface InterviewReportProps {
  result: any;
  questions: Question[];
  answers: Answer[];
  feedbacks: Record<string, string>;
  generating?: boolean;
  onRestart: () => void;
  onBackHome: () => void;
}

export default function InterviewReport({
  result,
  questions,
  answers,
  feedbacks,
  generating = false,
  onRestart,
  onBackHome,
}: InterviewReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'green';
    if (score >= 6) return 'yellow';
    return 'red';
  };
  const getScoreLabel = (score: number) => {
    if (score >= 9) return '优秀';
    if (score >= 7) return '良好';
    if (score >= 6) return '及格';
    return '需改进';
  };
  const score = result?.score || result?.report?.overallScore || 0;
  const normalizedScore = score > 10 ? Math.round(score / 10) : score;
  const reportDate = result?.created_at
    ? formatDateTime(result.created_at)
    : formatDateTime(new Date());
  const report = result?.report || {};
  const visualScores = [
    { label: '综合得分', value: normalizedScore * 10, color: '#6366f1' },
    { label: '表达完整度', value: Math.min(100, 55 + answers.length * 8), color: '#06b6d4' },
    { label: '面试完成度', value: Math.min(100, answers.length * 20), color: '#10b981' },
  ];

  if (generating || !result) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader size="lg" mb="md" />
        <Text size="lg" fw={500}>
          正在生成面试报告...
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          AI正在分析你的面试表现，请稍候
        </Text>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Paper shadow="sm" p="xl" radius="lg" mb="md" style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 58%, #ecfeff 100%)' }}>
        <div className="flex items-center justify-between">
          <div>
            <Group mb="xs">
              <Trophy size={24} className="text-yellow-500" />
              <Text size="xl" fw={700}>
                面试报告
              </Text>
            </Group>
            <Text c="dimmed" size="sm">
              {result.position || '面试评估'} · {reportDate}
            </Text>
          </div>
          <div className="text-center">
            <RingProgress
              size={100}
              thickness={10}
              sections={[
                {
                  value: normalizedScore * 10,
                  color: getScoreColor(normalizedScore),
                },
              ]}
              label={
                <div className="text-center">
                  <Text fw={700} size="xl">
                    {normalizedScore}
                  </Text>
                  <Text size="xs" c="dimmed">
                    /10
                  </Text>
                </div>
              }
            />
            <Text size="sm" fw={500} mt={4}>
              {getScoreLabel(normalizedScore)}
            </Text>
          </div>
        </div>
      </Paper>

      <Paper shadow="sm" p="lg" radius="lg" withBorder mb="md">
        <Text fw={700} mb="md">能力概览</Text>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visualScores.map((item) => (
            <div key={item.label} className="rounded-xl bg-gray-50 p-3">
              <div className="flex justify-between items-center mb-2">
                <Text size="sm" fw={500}>{item.label}</Text>
                <Text size="sm" fw={700} style={{ color: item.color }}>{Math.round(item.value)}%</Text>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div style={{ width: `${item.value}%`, backgroundColor: item.color }} className="h-full rounded-full transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
        {report.candidateProfile?.skills && Object.keys(report.candidateProfile.skills).length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {Object.entries(report.candidateProfile.skills).slice(0, 8).map(([skill, value]) => (
              <span key={skill} className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                {skill} · {String(value)}
              </span>
            ))}
          </div>
        )}
      </Paper>

      <Paper shadow="sm" p="lg" radius="md" withBorder mb="md">
        {result.report?.introductionEvaluation && (
          <div className="mb-4">
            <Group mb="sm">
              <MessageSquare size={16} className="text-purple-500" />
              <Text fw={600} size="sm">
                自我介绍评估
              </Text>
            </Group>
            <Paper
              p="sm"
              radius="sm"
              bg="purple.0"
              className="border-l-3 border-purple-500"
            >
              <MarkdownContent content={result.report.introductionEvaluation} />
            </Paper>
          </div>
        )}
        <div className="mb-4">
          <Group mb="sm">
            <CheckCircle size={16} className="text-green-500" />
            <Text fw={600} size="sm">
              优点
            </Text>
          </Group>
          <div className="space-y-1">
            {(result.report?.strengths || []).map((s: string, i: number) => (
              <Paper
                key={i}
                p="sm"
                radius="sm"
                bg="green.0"
                className="border-l-3 border-green-500"
              >
                <MarkdownContent content={s} />
              </Paper>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <Group mb="sm">
            <AlertCircle size={16} className="text-orange-500" />
            <Text fw={600} size="sm">
              需要改进
            </Text>
          </Group>
          <div className="space-y-1">
            {(result.report?.weaknesses || []).map((w: string, i: number) => (
              <Paper
                key={i}
                p="sm"
                radius="sm"
                bg="orange.0"
                className="border-l-3 border-orange-500"
              >
                <MarkdownContent content={w} />
              </Paper>
            ))}
          </div>
        </div>
        <div>
          <Group mb="sm">
            <Lightbulb size={16} className="text-blue-500" />
            <Text fw={600} size="sm">
              改进建议
            </Text>
          </Group>
          <div className="space-y-1">
            {(result.report?.suggestions || []).map((s: string, i: number) => (
              <Paper
                key={i}
                p="sm"
                radius="sm"
                bg="blue.0"
                className="border-l-3 border-blue-500"
              >
                <MarkdownContent content={s} />
              </Paper>
            ))}
          </div>
        </div>
      </Paper>

      <Paper shadow="sm" p="lg" radius="md" withBorder mb="md">
        <Group mb="md">
          <HelpCircle size={18} className="text-blue-500" />
          <Text fw={600}>面试题目回顾</Text>
          <Text size="xs" c="dimmed">
            共 {answers.length} 题
          </Text>
        </Group>
        <div className="space-y-4">
          {answers.map((answer, index) => {
            const question = questions.find((q) => q.id === answer.questionId);
            if (!question) return null;
            const feedback = feedbacks[question.id];
            return (
              <div key={question.id}>
                <Text size="xs" c="dimmed" mb={4}>
                  问题 {index + 1} ·{' '}
                  {question.isIntroduction
                    ? '自我介绍'
                    : question.section || '综合'}
                </Text>
                <Paper p="sm" radius="sm" bg="gray.0" mb={4}>
                  <MarkdownContent content={question.content} />
                </Paper>
                <Paper
                  p="sm"
                  radius="sm"
                  bg="blue.0"
                  className="border-l-3 border-blue-400"
                  mb={feedback ? 4 : 0}
                >
                  <Text size="xs" c="dimmed" mb={2}>
                    你的回答
                  </Text>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {answer.content}
                  </p>
                </Paper>
                {feedback && (
                  <Paper
                    p="sm"
                    radius="sm"
                    bg="green.0"
                    className="border-l-3 border-green-400"
                  >
                    <Text size="xs" c="dimmed" mb={2}>
                      AI 评价
                    </Text>
                    <MarkdownContent content={feedback} />
                  </Paper>
                )}
                {index < answers.length - 1 && (
                  <div className="border-b border-gray-200 mt-4" />
                )}
              </div>
            );
          })}
        </div>
      </Paper>

      <Group justify="center" mt="xl">
        <Button variant="outline" onClick={onRestart}>
          重新面试
        </Button>
        <Button onClick={onBackHome}>返回首页</Button>
      </Group>
    </div>
  );
}
