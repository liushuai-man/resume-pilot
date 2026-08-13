import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Loader, Text } from '@mantine/core';
import { useResumeStore } from '@/store/useResumeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUserStore } from '@/store/useUserStore';
import { resumeApi } from '@/api/home.api';
import { interviewApi, Question, Answer } from '@/api/interview.api';
import { jobApi } from '@/api/job.api';
import type { JobDescription, JobProfile } from '@/types/job';
import { uploadApi } from '@/api/upload.api';
import { contentToDocument } from '@/utils/resume-migration';
import { InterviewReport, InterviewChat } from '@/components/interview';
import { notifications } from '@mantine/notifications';
import { getApiErrorMessage } from '@/utils/api-error';
import InterviewWorkspaceRail, { type InterviewWorkspacePanel } from '@/components/interview/InterviewWorkspaceRail';
import JobProfilePanel from '@/components/interview/JobProfilePanel';
import InterviewTranscriptPanel from '@/components/interview/InterviewTranscriptPanel';
import InterviewToolbar from '@/components/interview/InterviewToolbar';
import InterviewResumePreview from '@/components/interview/InterviewResumePreview';

const InterviewPage = () => {
  const navigate = useNavigate();
  const { resumeId: paramResumeId } = useParams<{ resumeId?: string }>();
  const { resume, setResume, setContent, loadTemplate } = useResumeStore();
  const { loadDocument } = useDocumentStore();
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [targetPosition, setTargetPosition] = useState('');
  const [jobProfiles, setJobProfiles] = useState<Array<JobProfile & { company?: string | null }>>([]);
  const [selectedJobProfileId, setSelectedJobProfileId] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<string>('5');
  const [activeWorkspacePanel, setActiveWorkspacePanel] = useState<InterviewWorkspacePanel>('resume');
  const [workspaceCollapsed, setWorkspaceCollapsed] = useState(false);

  // 面试状态
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [interviewResult, setInterviewResult] = useState<any>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedPdfPage, setUploadedPdfPage] = useState(1);
  const [importedPreviewLoading, setImportedPreviewLoading] = useState(false);
  const [importedPreviewError, setImportedPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const interviewPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUploadedPdfPage(1);
    setImportedPreviewError(false);
    setImportedPreviewLoading(Boolean(resume?.content?.isUploadedFile));
  }, [resume?.id]);

  useEffect(() => {
    if (resume?.content?.isUploadedFile) {
      setImportedPreviewError(false);
      setImportedPreviewLoading(true);
    }
  }, [resume?.id, resume?.content?.isUploadedFile, uploadedPdfPage]);

  // 加载简历及其模板样式
  const loadResumeWithTemplate = useCallback(
    async (resumeData: any) => {
      setResume(resumeData);
      setContent(resumeData.content);

      let loadedTemplate: any = null;
      if (resumeData.template_id) {
        await loadTemplate(resumeData.template_id);
        loadedTemplate = useResumeStore.getState().template;
      }

      // 同步到 document store，让左侧预览和编辑页使用完全相同的渲染
      // 注意：与编辑器保持一致，仅使用 style_config.layout
      const layout = loadedTemplate?.style_config?.layout || 'classic';
      const doc = contentToDocument(
        resumeData.content,
        loadedTemplate?.style_config || null,
        layout
      );
      doc.id = resumeData.id;
      doc.title = resumeData.title;
      loadDocument(doc);
    },
    [setResume, setContent, loadTemplate, loadDocument]
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
      notifications.show({
        title: '简历加载失败',
        message: getApiErrorMessage(error, '请刷新页面后重试'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, paramResumeId, loadResumeWithTemplate]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  useEffect(() => {
    if (!user?.id) return;
    jobApi.list().then(async (response) => {
      const jobs = response.data || [];
      const profileGroups = await Promise.all(
        jobs.map(async (job: JobDescription) => {
          const profiles = (await jobApi.listProfiles(job.id)).data || [];
          return profiles.filter((profile) => profile.status === 'confirmed')
            .map((profile) => ({ ...profile, company: job.company }));
        })
      );
      setJobProfiles(profileGroups.flat());
    }).catch(() => setJobProfiles([]));
  }, [user?.id]);

  const handleStartInterview = async () => {
    const selectedResume = resumes.find((item) => item.id === selectedResumeId);
    if (!selectedResume) {
      setSelectedResumeId(null);
      notifications.show({
        title: '请先选择简历',
        message: '开始面试前，请创建一份简历或导入 PDF/图片简历',
        color: 'orange',
      });
      return;
    }

    setStarting(true);
    setIsThinking(true);
    try {
      console.log('开始面试，简历ID:', selectedResumeId);
      const result = await interviewApi.startInterview(
        selectedResume.id,
        targetPosition || undefined,
        parseInt(questionCount),
        selectedJobProfileId || undefined
      );
      console.log('面试开始成功:', result);
      setSessionId(result.sessionId);
      setCurrentQuestion(result.firstQuestion);
      setQuestions([result.firstQuestion]);
      setIsThinking(false);
    } catch (error) {
      console.error('开始面试失败:', error);
      notifications.show({
        title: '开始面试失败',
        message: getApiErrorMessage(error, '请检查模型配置和网络连接后重试'),
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
      const updatedAnswers = [...answers, newAnswer];

      // 先添加用户答案到列表
      setAnswers(updatedAnswers);
      setCurrentAnswer('');

      const result = await interviewApi.submitAnswer(
        sessionId,
        currentAnswer
      );

      if (result.isFinished) {
        await handleFinishInterview();
      } else {
        // Feedback is visible before the next LLM call begins.
        const nextQuestion = await interviewApi.getNextQuestion(sessionId);
        if (nextQuestion) {
          setCurrentQuestion(nextQuestion);
          setQuestions((prev) => [...prev, nextQuestion]);
        }
      }
      setIsThinking(false);
    } catch (error) {
      console.error('提交答案失败:', error);
      notifications.show({
        title: '提交答案失败',
        message: getApiErrorMessage(error, '请稍后重试'),
        color: 'red',
      });
      setIsThinking(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!sessionId) return;

    setFinishing(true);
    try {
      const result = await interviewApi.finishInterview(sessionId);

      setInterviewResult(result);
      setIsFinished(true);
      notifications.show(result.status === 'failed' ? {
        title: '报告生成失败', message: '完整问答已保存，可在面试记录中重试', color: 'red',
      } : { title: '完成', message: '面试已完成，查看报告', color: 'green' });
    } catch (error) {
      console.error('完成面试失败:', error);
      notifications.show({
        title: '完成面试失败',
        message: getApiErrorMessage(error, '请稍后重试'),
        color: 'red',
      });
    } finally {
      setFinishing(false);
    }
  };

  const handleRetryReport = async () => {
    if (!interviewResult?.id) return;
    setFinishing(true);
    try {
      const result = await interviewApi.retryInterviewReport(interviewResult.id);
      setInterviewResult(result);
      if (result.status === 'failed') throw new Error(result.error_message || '报告生成失败');
      notifications.show({ title: '报告已生成', message: '批量评价已完成', color: 'green' });
    } catch (error) {
      notifications.show({ title: '重试失败', message: getApiErrorMessage(error, '完整问答仍已安全保存，请稍后重试'), color: 'red' });
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
        title: '上传简历失败',
        message: getApiErrorMessage(error, '请检查文件格式和大小后重试'),
        color: 'red',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await resumeApi.deleteResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      if (selectedResumeId === resumeId) {
        const remaining = resumes.filter((r) => r.id !== resumeId);
        if (remaining.length > 0) {
          setSelectedResumeId(remaining[0].id);
        } else {
          setSelectedResumeId(null);
        }
      }
      notifications.show({
        title: '成功',
        message: '简历已删除',
        color: 'green',
      });
    } catch (error) {
      console.error('删除简历失败:', error);
      notifications.show({
        title: '删除简历失败',
        message: getApiErrorMessage(error, '请稍后重试'),
        color: 'red',
      });
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

  // 点击外部关闭下拉栏
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.resume-dropdown-container')) {
        setShowResumeDropdown(false);
      }
    };

    if (showResumeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResumeDropdown]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#F4F7F6]">
      <InterviewToolbar resumes={resumes} selectedResumeId={selectedResumeId} showResumeDropdown={showResumeDropdown}
        jobProfiles={jobProfiles} selectedJobProfileId={selectedJobProfileId} questionCount={questionCount}
        sessionId={sessionId} answerCount={answers.length} starting={starting} finishing={finishing} uploading={uploading}
        fileInputRef={fileInputRef} onToggleResumeDropdown={() => setShowResumeDropdown((value) => !value)}
        onSelectResume={(id) => { setSelectedResumeId(id); setShowResumeDropdown(false); }} onDeleteResume={handleDeleteResume}
        onSelectJobProfile={(id) => { const profile = jobProfiles.find((item) => item.id === id); setSelectedJobProfileId(id); setTargetPosition(profile?.jobTitle || ''); }}
        onQuestionCountChange={setQuestionCount} onFileUpload={handleFileUpload} onOpenHistory={() => navigate('/interviews/history')}
        onStart={handleStartInterview} onFinish={handleFinishInterview} />

      {/* 主内容 */}
      <div className="flex flex-1 overflow-hidden">
        <InterviewWorkspaceRail activePanel={activeWorkspacePanel} collapsed={workspaceCollapsed}
          onSelect={(panel) => { setActiveWorkspacePanel(panel); setWorkspaceCollapsed(false); }}
          onToggleCollapsed={() => setWorkspaceCollapsed((value) => !value)} />

        {/* 左侧辅助面板：仅控制布局，不修改面试会话 */}
        <div
          ref={interviewPreviewRef}
          className={`${workspaceCollapsed ? 'hidden' : 'w-[42%] min-w-[320px] max-w-[620px]'} flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-hidden`}
        >
          {activeWorkspacePanel === 'job' ? (
            <JobProfilePanel profile={jobProfiles.find((item) => item.id === selectedJobProfileId)} />
          ) : activeWorkspacePanel === 'transcript' ? (
            <InterviewTranscriptPanel questions={questions} answers={answers} getSectionName={getSectionName} />
          ) : (
            <InterviewResumePreview resume={resume} highlightSection={currentQuestion?.sectionKey} pdfPage={uploadedPdfPage}
              loading={importedPreviewLoading} error={importedPreviewError} onPageChange={setUploadedPdfPage}
              onLoad={() => setImportedPreviewLoading(false)} onError={() => { setImportedPreviewLoading(false); setImportedPreviewError(true); }} />
          )}
        </div>

        {/* 右侧：AI 面试官对话 */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto p-4 ">
            {isFinished ? (
              interviewResult?.status === 'failed' ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <Text fw={700} size="lg">报告生成失败</Text>
                  <Text size="sm" c="dimmed">完整问题和回答已经保存，不需要重新面试。</Text>
                  <Button onClick={handleRetryReport} loading={finishing}>重新生成报告</Button>
                </div>
              ) : <InterviewReport
                result={interviewResult}
                questions={questions}
                answers={answers}
                feedbacks={Object.fromEntries(
                  (interviewResult?.report?.questionEvaluations || []).map((item: any) => [item.questionId, item.feedback])
                )}
                generating={finishing && !interviewResult}
                onRestart={handleRestart}
                onBackHome={() => navigate('/resumes')}
              />
            ) : (
              <InterviewChat
                questions={questions}
                answers={answers}
                currentQuestion={currentQuestion}
                currentAnswer={currentAnswer}
                submitting={submitting}
                isThinking={isThinking}
                onAnswerChange={setCurrentAnswer}
                onSubmitAnswer={handleSubmitAnswer}
                getSectionName={getSectionName}
                sessionStarted={!!sessionId}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
