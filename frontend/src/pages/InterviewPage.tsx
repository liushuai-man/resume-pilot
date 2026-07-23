import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Select, Loader, Text } from '@mantine/core';
import { ArrowLeft, History, Play, Square, Bot, Upload } from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { useUserStore } from '@/store/useUserStore';
import { resumeApi } from '@/api/home.api';
import { interviewApi, Question, Answer } from '@/api/interview.api';
import { uploadApi } from '@/api/upload.api';
import ResizableResumePreview from '@/components/editor/ResizableResumePreview';
import { InterviewReport, InterviewChat } from '@/components/interview';
import { notifications } from '@mantine/notifications';

const InterviewPage = () => {
  const navigate = useNavigate();
  const { resumeId: paramResumeId } = useParams<{ resumeId?: string }>();
  const { resume, setResume, setContent, loadTemplate } = useResumeStore();
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
  const [isThinking, setIsThinking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载简历及其模板样式
  const loadResumeWithTemplate = useCallback(
    async (resumeData: any) => {
      setResume(resumeData);
      setContent(resumeData.content);
      if (resumeData.template_id) {
        await loadTemplate(resumeData.template_id);
      }
    },
    [setResume, setContent, loadTemplate]
  );

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
          await loadResumeWithTemplate(selectedResume);
        }
      } else if (userResumes.length > 0) {
        setSelectedResumeId(userResumes[0].id);
        await loadResumeWithTemplate(userResumes[0]);
      }
    } catch (error) {
      console.error('获取简历失败:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, paramResumeId, loadResumeWithTemplate]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleStartInterview = async () => {
    if (!selectedResumeId) return;

    setStarting(true);
    setIsThinking(true);
    try {
      console.log('开始面试，简历ID:', selectedResumeId);
      const result = await interviewApi.startInterview(
        selectedResumeId,
        targetPosition || undefined,
        parseInt(questionCount)
      );
      console.log('面试开始成功:', result);
      setSessionId(result.sessionId);
      setCurrentQuestion(result.firstQuestion);
      setQuestions([result.firstQuestion]);
      setFeedbacks({});
      setIsThinking(false);
    } catch (error) {
      console.error('开始面试失败:', error);
      notifications.show({
        title: '失败',
        message: '开始面试失败，请检查网络连接或重试',
        color: 'red',
      });
      // 重置状态
      setSessionId(null);
      setCurrentQuestion(null);
      setQuestions([]);
      setIsThinking(false);
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
    setIsThinking(true);
    try {
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        content: currentAnswer,
      };

      // 先添加用户答案到列表
      setAnswers((prev) => [...prev, newAnswer]);
      setCurrentAnswer('');

      const result = await interviewApi.submitAnswer(
        sessionId,
        currentQuestion,
        currentAnswer,
        selectedResumeId
      );

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
      }
      setIsThinking(false);
    } catch (error) {
      console.error('提交答案失败:', error);
      notifications.show({
        title: '失败',
        message: '提交答案失败',
        color: 'red',
      });
      setIsThinking(false);
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

  const handleRestart = () => {
    setSessionId(null);
    setCurrentQuestion(null);
    setQuestions([]);
    setAnswers([]);
    setFeedbacks({});
    setIsFinished(false);
    setInterviewResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedTypes.includes(file.type)) {
      notifications.show({
        title: '错误',
        message: '不支持的文件类型，仅支持PDF和图片格式',
        color: 'red',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await uploadApi.uploadResume(file);

      setResumes((prev) => [result.resume, ...prev]);
      setSelectedResumeId(result.resume.id);

      notifications.show({
        title: '成功',
        message: `简历导入成功，识别了${result.fileInfo.pageCount || 1}页内容`,
        color: 'green',
      });
    } catch (error) {
      console.error('上传简历失败:', error);
      notifications.show({
        title: '失败',
        message: '上传简历失败，请重试',
        color: 'red',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // 更新选中的简历
  useEffect(() => {
    if (selectedResumeId && resumes.length > 0) {
      const selected = resumes.find((r) => r.id === selectedResumeId);
      if (selected) {
        loadResumeWithTemplate(selected);
      }
    }
  }, [selectedResumeId, resumes, loadResumeWithTemplate]);

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
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="xs"
              onClick={() => navigate(-1)}
              className="h-7 px-3 border-blue-400 text-blue-500 bg-white hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={12} className="mr-1" />
              返回
            </Button>
            <Text size="lg" fw={500} className="whitespace-nowrap">
              在线面试
            </Text>
          </div>

          {/* 配置区域 */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            <Select
              placeholder="选择简历"
              data={resumes.map((r) => ({
                label: r.title,
                value: r.id,
              }))}
              value={selectedResumeId}
              onChange={setSelectedResumeId}
              size="xs"
              className="w-48"
              disabled={!!sessionId}
            />
            <input
              type="text"
              placeholder="目标岗位（可选）"
              value={targetPosition}
              onChange={(e) => setTargetPosition(e.target.value)}
              className="h-7 px-3 text-xs border border-gray-300 rounded-md w-40 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={!!sessionId}
            />
            <Select
              data={[
                { label: '3题', value: '3' },
                { label: '5题', value: '5' },
                { label: '8题', value: '8' },
                { label: '10题', value: '10' },
              ]}
              value={questionCount}
              onChange={(val) => setQuestionCount(val || '5')}
              size="xs"
              className="w-24"
              disabled={!!sessionId}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              className="hidden"
            />
            <Button
              variant="outline"
              size="xs"
              leftSection={<Upload size={14} />}
              onClick={() => fileInputRef.current?.click()}
              loading={uploading}
              disabled={!!sessionId}
            >
              导入简历
            </Button>
            {!sessionId ? (
              <>
                <Button
                  variant="subtle"
                  size="xs"
                  leftSection={<History size={14} />}
                  onClick={() => navigate('/resume/interview/history')}
                >
                  面试记录
                </Button>
                <Button
                  size="xs"
                  leftSection={<Play size={14} />}
                  onClick={handleStartInterview}
                  loading={starting}
                  disabled={!selectedResumeId}
                >
                  开始面试
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="xs"
                color="red"
                leftSection={<Square size={14} />}
                onClick={handleFinishInterview}
                loading={finishing}
              >
                结束面试
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧：简历预览 */}
        <ResizableResumePreview
          content={resume?.content || null}
          highlightSection={currentQuestion?.sectionKey}
          className="w-1/2 flex-shrink-0 border-r border-gray-200 bg-gray-100 p-4"
        />

        {/* 右侧：AI 面试官对话 */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4">
            {!sessionId && !isFinished ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot size={48} className="text-blue-400 mb-4" />
                <Text size="lg" fw={500} mb="sm">
                  准备开始面试
                </Text>
                <Text c="dimmed" size="sm">
                  请在顶部选择简历，然后点击"开始面试"按钮
                </Text>
              </div>
            ) : isFinished ? (
              <InterviewReport
                result={interviewResult}
                questions={questions}
                answers={answers}
                feedbacks={feedbacks}
                generating={finishing && !interviewResult}
                onRestart={handleRestart}
                onBackHome={() => navigate('/')}
              />
            ) : (
              <InterviewChat
                questions={questions}
                answers={answers}
                feedbacks={feedbacks}
                currentQuestion={currentQuestion}
                currentAnswer={currentAnswer}
                questionCount={parseInt(questionCount)}
                submitting={submitting}
                isThinking={isThinking}
                onAnswerChange={setCurrentAnswer}
                onSubmitAnswer={handleSubmitAnswer}
                getSectionName={getSectionName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
