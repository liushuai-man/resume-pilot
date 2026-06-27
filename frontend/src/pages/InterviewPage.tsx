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
  Space,
  Stack,
  Title,
} from '@mantine/core';
import { ArrowLeft, Send, User, Bot } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { useUserStore } from '@/store/useUserStore';
import { resumeApi } from '@/api/home.api';
import { interviewApi, Question, Answer } from '@/api/interview.api';
import ResumePreview from '@/components/editor/ResumePreview';
import { notifications } from '@mantine/notifications';

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

  // 面试状态
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [interviewResult, setInterviewResult] = useState<any>(null);

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

  const handleStartInterview = async () => {
    if (!selectedResumeId) return;

    setStarting(true);
    try {
      const result = await interviewApi.startInterview(selectedResumeId);
      setSessionId(result.sessionId);
      setCurrentQuestion(result.firstQuestion);
      setQuestions([result.firstQuestion]);
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
      // 保存当前答案
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        content: currentAnswer,
      };

      // 提交答案
      const result = await interviewApi.submitAnswer(
        sessionId,
        currentQuestion,
        currentAnswer,
        selectedResumeId
      );

      // 更新状态
      setAnswers((prev) => [...prev, newAnswer]);
      setFeedback(result.feedback);

      if (result.isFinished || !result.nextQuestion) {
        // 面试结束
        await handleFinishInterview();
      } else {
        // 继续下一题
        setCurrentQuestion(result.nextQuestion);
        setQuestions((prev) => [...prev, result.nextQuestion!]);
        setCurrentAnswer('');
        setFeedback(null);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [questions, answers, feedback]);

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
            <Select
              placeholder="选择简历"
              data={resumes.map((r) => ({ label: r.title, value: r.id }))}
              value={selectedResumeId}
              onChange={setSelectedResumeId}
              className="w-64"
              size="xs"
            />
          )}
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：简历预览 - 固定宽度，与编辑器中的预览区一致 */}
        <div className="w-[850px] flex-shrink-0 border-r border-gray-200 overflow-hidden bg-gray-100">
          <div className="h-full overflow-y-auto p-4 flex items-start justify-center">
            <div className="w-full">
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

        {/* 右侧：AI 面试官对话 - flex-1 自适应 */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4">
            {!sessionId ? (
              /* 未开始面试：显示开始界面 */
              <div className="flex flex-col items-center justify-center h-full">
                <Stack align="center" gap="md">
                  <Title order={2}>AI 模拟面试</Title>
                  <Text c="dimmed">
                    基于你的简历内容，AI 面试官将提出针对性的问题
                  </Text>
                  <Button
                    variant="filled"
                    size="lg"
                    onClick={handleStartInterview}
                    loading={starting}
                    disabled={!selectedResumeId}
                  >
                    开始面试
                  </Button>
                </Stack>
              </div>
            ) : isFinished && interviewResult ? (
              /* 面试结束：显示报告 */
              <div className="max-w-3xl mx-auto">
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                  <Stack gap="lg">
                    <div className="text-center">
                      <Title order={2} c="blue">
                        面试完成！
                      </Title>
                      <Text size="xl" fw={600} mt="md">
                        综合评分：{interviewResult.score}/10
                      </Text>
                    </div>

                    <Space />

                    <div>
                      <Title order={4} mb="md">
                        优点
                      </Title>
                      <ul className="list-disc list-inside space-y-1">
                        {interviewResult.report?.strengths?.map(
                          (s: string, i: number) => (
                            <li key={i} className="text-green-700">
                              {s}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <Title order={4} mb="md">
                        需要改进
                      </Title>
                      <ul className="list-disc list-inside space-y-1">
                        {interviewResult.report?.weaknesses?.map(
                          (w: string, i: number) => (
                            <li key={i} className="text-orange-700">
                              {w}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <Title order={4} mb="md">
                        改进建议
                      </Title>
                      <ul className="list-disc list-inside space-y-1">
                        {interviewResult.report?.improvements?.map(
                          (i: string, idx: number) => (
                            <li key={idx} className="text-blue-700">
                              {i}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <Group justify="center" mt="xl">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSessionId(null);
                          setCurrentQuestion(null);
                          setQuestions([]);
                          setAnswers([]);
                          setIsFinished(false);
                          setInterviewResult(null);
                        }}
                      >
                        重新面试
                      </Button>
                      <Button onClick={() => navigate('/')}>返回首页</Button>
                    </Group>
                  </Stack>
                </Card>
              </div>
            ) : (
              /* 面试进行中：显示对话 */
              <Stack gap="md" className="max-w-3xl mx-auto">
                {/* 历史对话 */}
                {questions.map((question, index) => {
                  const answer = answers.find(
                    (a) => a.questionId === question.id
                  );

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
                            <Text>{answer.content}</Text>
                          </Paper>

                          {/* 反馈 */}
                          {index < answers.length - 1 && (
                            <Paper p="md" radius="md" bg="green.50" mt="md">
                              <Text size="sm" c="dimmed">
                                反馈
                              </Text>
                              <Text c="green.700">{feedback}</Text>
                            </Paper>
                          )}
                        </Box>
                      )}

                      <Space h="md" />
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

                    {/* 显示前一题的反馈 */}
                    {feedback && (
                      <Paper p="md" radius="md" bg="green.50" mb="md">
                        <Text size="sm" c="dimmed">
                          反馈
                        </Text>
                        <Text c="green.700">{feedback}</Text>
                      </Paper>
                    )}

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
