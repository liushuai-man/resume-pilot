import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Textarea,
  Select,
  Loader,
  Card,
  Text,
  Box,
  Paper,
  Group,
  Stack,
  Title,
  TextInput,
  Progress,
  RingProgress,
} from '@mantine/core';
import {
  ArrowLeft,
  Send,
  User,
  Bot,
  Trophy,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  History,
} from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { useUserStore } from '@/store/useUserStore';
import { resumeApi } from '@/api/home.api';
import { interviewApi, Question, Answer } from '@/api/interview.api';
import ResumePreview from '@/components/editor/ResumePreview';
import { notifications } from '@mantine/notifications';
import { formatDateTime } from '@/utils/format';

const RESUME_WIDTH = 850;
const MIN_SCALE = 0.4;

const InterviewPage = () => {
  const navigate = useNavigate();
  const { resumeId: paramResumeId } = useParams<{ resumeId?: string }>();
  const { resume, setResume } = useResumeStore();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState('');
  const [questionCount, setQuestionCount] = useState<string>('5');

  // 面试状态
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [interviewResult, setInterviewResult] = useState<any>(null);

  // 缩放状态
  const [scale, setScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 获取用户的所有简历
  const fetchResumes = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await resumeApi.getUserResumes();
      const userResumes = response.data || [];
      setResumes(userResumes);

      if (
        paramResumeId &&
        userResumes.some((r: any) => r.id === paramResumeId)
      ) {
        setSelectedResumeId(paramResumeId);
        const selectedResume = userResumes.find(
          (r: any) => r.id === paramResumeId
        );
        if (selectedResume) {
          setResume(selectedResume);
        }
      } else if (userResumes.length > 0) {
        setSelectedResumeId(userResumes[0].id);
        setResume(userResumes[0]);
      }
    } catch (error) {
      console.error('获取简历失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, paramResumeId, setResume]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const updateScale = () => {
      const width = container.offsetWidth;
      const newScale = Math.min(Math.max(width / RESUME_WIDTH, MIN_SCALE), 1);
      setScale(newScale);

      if (contentRef.current) {
        setPreviewHeight(contentRef.current.offsetHeight * newScale);
      }
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setPreviewHeight(contentRef.current.offsetHeight * scale);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => observer.disconnect();
  }, [resume, scale]);

  const handleStartInterview = async () => {
    if (!selectedResumeId) return;

    setStarting(true);
    try {
      const result = await interviewApi.startInterview(
        selectedResumeId,
        targetPosition || undefined,
        parseInt(questionCount)
      );
      setSessionId(result.sessionId);
      setCurrentQuestion(result.firstQuestion);
      setQuestions([result.firstQuestion]);
      setFeedbacks({});
    } catch (error) {
      console.error('开始面试失败:', error);
      notifications.show({
        title: '失败',
        message: '开始面试失败',
        color: 'red',
      });
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (
      !currentQuestion ||
      !sessionId ||
      !selectedResumeId ||
      !currentAnswer.trim()
    )
      return;

    setSubmitting(true);
    try {
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        content: currentAnswer,
      };

      const result = await interviewApi.submitAnswer(
        sessionId,
        currentQuestion,
        currentAnswer,
        selectedResumeId
      );

      setAnswers((prev) => [...prev, newAnswer]);
      // 按 questionId 存储每题的独立反馈
      setFeedbacks((prev) => ({
        ...prev,
        [currentQuestion.id]: result.feedback,
      }));

      if (result.isFinished || !result.nextQuestion) {
        await handleFinishInterview();
      } else {
        setCurrentQuestion(result.nextQuestion);
        setQuestions((prev) => [...prev, result.nextQuestion!]);
        setCurrentAnswer('');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      notifications.show({
        title: '失败',
        message: '提交答案失败',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!sessionId || !selectedResumeId) return;

    setFinishing(true);
    try {
      const result = await interviewApi.finishInterview(
        sessionId,
        selectedResumeId,
        questions,
        answers
      );

      setInterviewResult(result);
      setIsFinished(true);
      notifications.show({
        title: '完成',
        message: '面试已完成，查看报告',
        color: 'green',
      });
    } catch (error) {
      console.error('完成面试失败:', error);
      notifications.show({
        title: '失败',
        message: '完成面试失败',
        color: 'red',
      });
    } finally {
      setFinishing(false);
    }
  };

  const getSectionName = (sectionKey: string) => {
    const names: Record<string, string> = {
      basicInfo: '基本信息',
      experience: '工作经历',
      projects: '项目经历',
      skills: '技能',
      education: '教育经历',
      careerObjective: '职业目标',
      certifications: '证书',
      campusExperiences: '校园经历',
    };
    return names[sectionKey] || sectionKey;
  };

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [questions, answers, feedbacks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
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
            <Text size="lg" fw={500}>
              在线面试
            </Text>
          </div>

          {!sessionId && (
            <Button
              variant="subtle"
              size="xs"
              leftSection={<History size={14} />}
              onClick={() => navigate('/resume/interview/history')}
            >
              面试记录
            </Button>
          )}
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：简历预览 */}
        <div
          ref={previewContainerRef}
          className="flex-1 flex-shrink-0 border-r border-gray-200 overflow-hidden bg-gray-100"
        >
          <div className="h-full overflow-y-auto p-4 flex items-start justify-center">
            <div
              ref={contentRef}
              className="transition-transform duration-300 ease-out"
              style={{
                width: RESUME_WIDTH,
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                height: previewHeight,
              }}
            >
              {resume ? (
                <ResumePreview
                  content={resume.content}
                  highlightSection={currentQuestion?.sectionKey}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Text>请选择简历</Text>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：AI 面试官对话 */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4">
            {!sessionId ? (
              /* 未开始面试：显示开始界面 */
              <div className="flex flex-col items-center justify-center h-full">
                <Card
                  shadow="sm"
                  padding="xl"
                  radius="md"
                  withBorder
                  className="w-full max-w-md"
                >
                  <Stack align="center" gap="lg">
                    <Bot size={48} className="text-blue-500" />
                    <Title order={3}>AI 模拟面试</Title>
                    <Text c="dimmed" size="sm" className="text-center">
                      基于你的简历内容，AI
                      面试官将提出针对性的问题，帮助你准备真实面试
                    </Text>

                    <div className="w-full">
                      <Select
                        label="选择简历"
                        placeholder="请选择要面试的简历"
                        data={resumes.map((r) => ({
                          label: r.title,
                          value: r.id,
                        }))}
                        value={selectedResumeId}
                        onChange={setSelectedResumeId}
                        size="sm"
                        mb="md"
                      />

                      <TextInput
                        label="目标岗位"
                        placeholder="如：前端开发工程师（可选）"
                        value={targetPosition}
                        onChange={(e) =>
                          setTargetPosition(e.currentTarget.value)
                        }
                        size="sm"
                        mb="md"
                      />

                      <Select
                        label="面试题数"
                        data={[
                          { label: '3 题（快速）', value: '3' },
                          { label: '5 题（标准）', value: '5' },
                          { label: '8 题（详细）', value: '8' },
                          { label: '10 题（全面）', value: '10' },
                        ]}
                        value={questionCount}
                        onChange={(val) => setQuestionCount(val || '5')}
                        size="sm"
                        mb="xl"
                      />

                      <Button
                        variant="filled"
                        size="lg"
                        fullWidth
                        onClick={handleStartInterview}
                        loading={starting}
                        disabled={!selectedResumeId}
                      >
                        开始面试
                      </Button>
                    </div>
                  </Stack>
                </Card>
              </div>
            ) : isFinished && interviewResult ? (
              /* 面试结束：显示报告 */
              <div className="max-w-3xl mx-auto">
                {/* 报告头部 */}
                <Card shadow="sm" padding="xl" radius="md" withBorder mb="md">
                  <div className="flex items-center justify-between">
                    <div>
                      <Group mb="xs">
                        <Trophy size={24} className="text-yellow-500" />
                        <Title order={2}>面试报告</Title>
                      </Group>
                      <Text c="dimmed" size="sm">
                        {interviewResult.position || '面试评估'} ·{' '}
                        {formatDateTime(interviewResult.created_at)}
                      </Text>
                    </div>
                    <div className="text-center">
                      <RingProgress
                        size={100}
                        thickness={10}
                        sections={[
                          {
                            value: (interviewResult.score || 0) * 10,
                            color: getScoreColor(interviewResult.score || 0),
                          },
                        ]}
                        label={
                          <div className="text-center">
                            <Text fw={700} size="xl">
                              {interviewResult.score || 0}
                            </Text>
                            <Text size="xs" c="dimmed">
                              /10
                            </Text>
                          </div>
                        }
                      />
                      <Text size="sm" fw={500} mt={4}>
                        {getScoreLabel(interviewResult.score || 0)}
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
                    {(interviewResult.report?.strengths || []).map(
                      (s: string, i: number) => (
                        <Paper
                          key={i}
                          p="sm"
                          radius="sm"
                          bg="green.0"
                          className="border-l-3 border-green-500"
                        >
                          <Text size="sm">{s}</Text>
                        </Paper>
                      )
                    )}
                  </Stack>
                </Card>

                {/* 需要改进 */}
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                  <Group mb="md">
                    <AlertCircle size={18} className="text-orange-500" />
                    <Text fw={600}>需要改进</Text>
                  </Group>
                  <Stack gap="xs">
                    {(interviewResult.report?.weaknesses || []).map(
                      (w: string, i: number) => (
                        <Paper
                          key={i}
                          p="sm"
                          radius="sm"
                          bg="orange.0"
                          className="border-l-3 border-orange-500"
                        >
                          <Text size="sm">{w}</Text>
                        </Paper>
                      )
                    )}
                  </Stack>
                </Card>

                {/* 改进建议 */}
                <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                  <Group mb="md">
                    <Lightbulb size={18} className="text-blue-500" />
                    <Text fw={600}>改进建议</Text>
                  </Group>
                  <Stack gap="xs">
                    {(interviewResult.report?.suggestions || []).map(
                      (s: string, i: number) => (
                        <Paper
                          key={i}
                          p="sm"
                          radius="sm"
                          bg="blue.0"
                          className="border-l-3 border-blue-500"
                        >
                          <Text size="sm">{s}</Text>
                        </Paper>
                      )
                    )}
                  </Stack>
                </Card>

                {/* 操作按钮 */}
                <Group justify="center" mt="xl">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSessionId(null);
                      setCurrentQuestion(null);
                      setQuestions([]);
                      setAnswers([]);
                      setFeedbacks({});
                      setIsFinished(false);
                      setInterviewResult(null);
                    }}
                  >
                    重新面试
                  </Button>
                  <Button onClick={() => navigate('/')}>返回首页</Button>
                </Group>
              </div>
            ) : (
              /* 面试进行中：显示对话 */
              <Stack gap="md" className="max-w-3xl mx-auto">
                {/* 进度条 */}
                <Paper p="sm" radius="md" bg="gray.50" withBorder>
                  <Group justify="apart" mb={4}>
                    <Text size="xs" c="dimmed">
                      面试进度
                    </Text>
                    <Text size="xs" c="dimmed">
                      {answers.length} / {parseInt(questionCount)} 题
                    </Text>
                  </Group>
                  <Progress
                    value={(answers.length / parseInt(questionCount)) * 100}
                    size="sm"
                    radius="xl"
                  />
                </Paper>

                {/* 历史对话 */}
                {questions.map((question) => {
                  const answer = answers.find(
                    (a) => a.questionId === question.id
                  );
                  const questionFeedback = feedbacks[question.id];

                  return (
                    <div key={question.id}>
                      {/* 问题 */}
                      <Paper p="md" radius="md" bg="gray.50" withBorder>
                        <Group mb="xs">
                          <Bot size={16} className="text-blue-500" />
                          <Text size="sm" c="dimmed">
                            AI 面试官 ({getSectionName(question.sectionKey)})
                          </Text>
                        </Group>
                        <Text fw={500}>{question.content}</Text>
                      </Paper>

                      {/* 答案 */}
                      {answer && (
                        <Box ml="xl" mt="md">
                          <Paper p="md" radius="md" bg="blue.50" withBorder>
                            <Group mb="xs">
                              <User size={16} className="text-blue-500" />
                              <Text size="sm" c="dimmed">
                                你的回答
                              </Text>
                            </Group>
                            <Text size="sm">{answer.content}</Text>
                          </Paper>

                          {/* 每题独立反馈 */}
                          {questionFeedback && (
                            <Paper p="md" radius="md" bg="green.50" mt="sm">
                              <Text size="xs" c="dimmed" mb={4}>
                                AI 反馈
                              </Text>
                              <Text size="sm" c="green.700">
                                {questionFeedback}
                              </Text>
                            </Paper>
                          )}
                        </Box>
                      )}
                    </div>
                  );
                })}

                {/* 当前问题和回答输入框 */}
                {currentQuestion && (
                  <div>
                    <Paper p="md" radius="md" bg="gray.50" withBorder mb="md">
                      <Group mb="xs">
                        <Bot size={16} className="text-blue-500" />
                        <Text size="sm" c="dimmed">
                          AI 面试官 (
                          {getSectionName(currentQuestion.sectionKey)})
                        </Text>
                      </Group>
                      <Text fw={500}>{currentQuestion.content}</Text>
                    </Paper>

                    <Textarea
                      placeholder="请输入你的回答..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      minRows={4}
                      autosize
                      size="md"
                      mb="md"
                    />

                    <Group justify="apart">
                      <Button
                        variant="outline"
                        onClick={handleFinishInterview}
                        loading={finishing}
                      >
                        结束面试
                      </Button>
                      <Button
                        leftSection={<Send size={14} />}
                        onClick={handleSubmitAnswer}
                        loading={submitting}
                        disabled={!currentAnswer.trim()}
                      >
                        提交答案
                      </Button>
                    </Group>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </Stack>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
