import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Badge,
  RingProgress,
} from '@mantine/core';
import {
  Calendar,
  FileText,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { interviewApi, InterviewResult } from '@/api/interview.api';
import { formatDateTime } from '@/utils/format';
import { notifications } from '@mantine/notifications';
import PageHeader from '@/components/common/PageHeader';

const InterviewHistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<InterviewResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await interviewApi.getInterviewResults();
        setResults(data);
      } catch (error) {
        console.error('获取面试记录失败:', error);
        notifications.show({
          title: '错误',
          message: '获取面试记录失败',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这条面试记录吗？')) {
      return;
    }

    try {
      await interviewApi.deleteInterviewResult(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
      notifications.show({
        title: '成功',
        message: '面试记录已删除',
        color: 'green',
      });
    } catch (error) {
      console.error('删除面试记录失败:', error);
      notifications.show({
        title: '错误',
        message: '删除面试记录失败',
        color: 'red',
      });
    }
  };

  const getScoreColor = (score: number) => {
    const normalizedScore = score > 10 ? Math.round(score / 10) : score;
    if (normalizedScore >= 8) return 'green';
    if (normalizedScore >= 6) return 'yellow';
    return 'red';
  };

  const getScoreLabel = (score: number) => {
    const normalizedScore = score > 10 ? Math.round(score / 10) : score;
    if (normalizedScore >= 9) return '优秀';
    if (normalizedScore >= 7) return '良好';
    if (normalizedScore >= 6) return '及格';
    return '需改进';
  };

  if (loading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-2">
      <PageHeader eyebrow="INTERVIEW HISTORY" title="面试记录" description="查看每一次模拟面试及最终报告。ATS 分析归目标岗位，简历优化记录归我的简历。" action={<button onClick={() => navigate('/interviews')} className="inline-flex items-center gap-2 rounded-lg bg-[#176B52] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#115640] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/35">开始面试</button>} />

      {/* 内容 */}
      <div className="mx-auto mt-6 max-w-4xl">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText size={48} className="text-gray-300 mb-4" />
            <Text c="dimmed" size="lg">
              暂无面试记录
            </Text>
            <Button
              variant="outline"
              mt="md"
              onClick={() => navigate('/interviews')}
            >
              开始面试
            </Button>
          </div>
        ) : (
          <Stack gap="md">
            {results.map((result) => (
              <Card
                key={result.id}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() =>
                  navigate(`/interviews/results/${result.id}`)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <RingProgress
                      size={64}
                      thickness={6}
                      sections={[
                        {
                          value: result.score || 0,
                          color: getScoreColor(result.score || 0),
                        },
                      ]}
                      label={
                        <div className="text-center">
                          <Text fw={700} size="sm">
                            {result.score > 10
                              ? Math.round((result.score || 0) / 10)
                              : result.score || 0}
                          </Text>
                        </div>
                      }
                    />
                    <div>
                      <Group gap="sm" mb={4}>
                        <Text fw={600}>{result.position || '面试评估'}</Text>
                        <Badge
                          color={getScoreColor(result.score || 0)}
                          variant="light"
                          size="sm"
                        >
                          {getScoreLabel(result.score || 0)}
                        </Badge>
                      </Group>
                      <Group gap="md">
                        {result.resume && (
                          <Group gap={4}>
                            <FileText size={12} className="text-gray-400" />
                            <Text size="xs" c="dimmed">
                              {result.resume.title}
                            </Text>
                          </Group>
                        )}
                        <Group gap={4}>
                          <Calendar size={12} className="text-gray-400" />
                          <Text size="xs" c="dimmed">
                            {formatDateTime(result.created_at)}
                          </Text>
                        </Group>
                      </Group>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(result.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除面试记录"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              </Card>
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
};

export default InterviewHistoryPage;
