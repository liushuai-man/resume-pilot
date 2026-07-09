import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Text,
  Group,
  Stack,
  Title,
  Loader,
  Badge,
  RingProgress,
} from '@mantine/core';
import {
  ArrowLeft,
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { interviewApi, InterviewResult } from '@/api/interview.api';
import { formatDateTime } from '@/utils/format';
import { notifications } from '@mantine/notifications';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate(-1)}
            className="h-7 px-3 border-blue-400 text-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={12} className="mr-1" />
            返回
          </Button>
          <Title order={4}>面试记录</Title>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-4xl mx-auto p-6">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText size={48} className="text-gray-300 mb-4" />
            <Text c="dimmed" size="lg">
              暂无面试记录
            </Text>
            <Button
              variant="outline"
              mt="md"
              onClick={() => navigate('/resume/interview')}
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
                onClick={() => navigate(`/resume/interview/result/${result.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <RingProgress
                      size={64}
                      thickness={6}
                      sections={[
                        {
                          value: (result.score || 0) * 10,
                          color: getScoreColor(result.score || 0),
                        },
                      ]}
                      label={
                        <div className="text-center">
                          <Text fw={700} size="sm">
                            {result.score || 0}
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
                  <ChevronRight size={20} className="text-gray-400" />
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
