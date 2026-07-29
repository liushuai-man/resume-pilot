import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Text,
  Group,
  Stack,
  Title,
  Loader,
  Paper,
  RingProgress,
} from '@mantine/core';
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { interviewApi, InterviewResult } from '@/api/interview.api';
import { formatDateTime } from '@/utils/format';
import { notifications } from '@mantine/notifications';

const InterviewResultPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<InterviewResult | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        const data = await interviewApi.getInterviewResult(id);
        setResult(data);
      } catch (error) {
        console.error('获取面试结果失败:', error);
        notifications.show({
          title: '错误',
          message: '获取面试结果失败',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

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
      <div className="flex items-center justify-center h-screen">
        <Loader size="xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Text c="dimmed">未找到面试结果</Text>
        <Button variant="outline" mt="md" onClick={() => navigate(-1)}>
          返回
        </Button>
      </div>
    );
  }

  const reportDate = result.created_at
    ? formatDateTime(result.created_at)
    : formatDateTime(new Date());

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
          <Title order={4}>面试报告</Title>
        </div>
      </div>

      {/* 内容 */}
      <div className="max-w-3xl mx-auto p-6">
        {/* 报告头部 */}
        <Card shadow="sm" padding="xl" radius="md" withBorder mb="md">
          <div className="flex items-center justify-between">
            <div>
              <Group mb="xs">
                <Trophy size={24} className="text-yellow-500" />
                <Title order={2}>面试报告</Title>
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
                    value: result.score || 0,
                    color: getScoreColor(result.score || 0),
                  },
                ]}
                label={
                  <div className="text-center">
                    <Text fw={700} size="xl">
                      {result.score > 10
                        ? Math.round((result.score || 0) / 10)
                        : result.score || 0}
                    </Text>
                    <Text size="xs" c="dimmed">
                      /10
                    </Text>
                  </div>
                }
              />
              <Text size="sm" fw={500} mt={4}>
                {getScoreLabel(result.score || 0)}
              </Text>
            </div>
          </div>
        </Card>

        {/* 优点 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
          <Group mb="md">
            <CheckCircle size={18} className="text-green-500" />
            <Text fw={600}>优点</Text>
          </Group>
          <Stack gap="xs">
            {(result.report?.strengths || []).map((s: string, i: number) => (
              <Paper
                key={i}
                p="sm"
                radius="sm"
                bg="green.0"
                className="border-l-3 border-green-500"
              >
                <Text size="sm">{s}</Text>
              </Paper>
            ))}
          </Stack>
        </Card>

        {/* 需要改进 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
          <Group mb="md">
            <AlertCircle size={18} className="text-orange-500" />
            <Text fw={600}>需要改进</Text>
          </Group>
          <Stack gap="xs">
            {(result.report?.weaknesses || []).map((w: string, i: number) => (
              <Paper
                key={i}
                p="sm"
                radius="sm"
                bg="orange.0"
                className="border-l-3 border-orange-500"
              >
                <Text size="sm">{w}</Text>
              </Paper>
            ))}
          </Stack>
        </Card>

        {/* 改进建议 */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
          <Group mb="md">
            <Lightbulb size={18} className="text-blue-500" />
            <Text fw={600}>改进建议</Text>
          </Group>
          <Stack gap="xs">
            {(result.report?.suggestions || []).map((s: string, i: number) => (
              <Paper
                key={i}
                p="sm"
                radius="sm"
                bg="blue.0"
                className="border-l-3 border-blue-500"
              >
                <Text size="sm">{s}</Text>
              </Paper>
            ))}
          </Stack>
        </Card>

        {/* 操作按钮 */}
        <Group justify="center" mt="xl">
          <Button
            variant="outline"
            onClick={() => navigate('/resume/interview')}
          >
            重新面试
          </Button>
          <Button onClick={() => navigate('/')}>返回首页</Button>
        </Group>
      </div>
    </div>
  );
};

export default InterviewResultPage;
