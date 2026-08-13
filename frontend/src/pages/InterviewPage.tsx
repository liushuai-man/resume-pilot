import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Select, Loader, Text, Progress } from '@mantine/core';
import {
  History,
  Play,
  Square,
  Upload,
  Trash2,
  FileText,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness,
  ListChecks,
} from 'lucide-react';
import { useResumeStore } from '@/store/useResumeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useUserStore } from '@/store/useUserStore';
import { resumeApi } from '@/api/home.api';
import { interviewApi, Question, Answer } from '@/api/interview.api';
import { jobApi } from '@/api/job.api';
import type { JobDescription, JobProfile } from '@/types/job';
import { uploadApi } from '@/api/upload.api';
import { contentToDocument } from '@/utils/resume-migration';
import ResizableResumePreview from '@/components/editor/ResizableResumePreview';
import { InterviewReport, InterviewChat } from '@/components/interview';
import { notifications } from '@mantine/notifications';
import { getApiErrorMessage } from '@/utils/api-error';

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
  const [activeWorkspacePanel, setActiveWorkspacePanel] = useState<'resume' | 'job' | 'transcript'>('resume');

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
      {/* 顶部导航栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Text size="lg" fw={600} className="whitespace-nowrap text-[#17211D]">
              模拟面试工作台
            </Text>
          </div>

          {/* 配置区域 */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="relative resume-dropdown-container">
              <button
                onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                disabled={!!sessionId}
                className={`flex items-center justify-between w-56 h-7 px-3 text-xs border rounded-md transition-colors ${
                  !!sessionId
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500'
                }`}
              >
                <span className="truncate">
                  {selectedResumeId
                    ? resumes.find((r) => r.id === selectedResumeId)?.title ||
                      '选择简历'
                    : '选择简历'}
                </span>
                <svg
                  className={`w-4 h-4 ml-2 transition-transform ${showResumeDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showResumeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto">
                    {resumes.map((r) => {
                      const isUploaded = r.content?.isUploadedFile;
                      const isSelected = r.id === selectedResumeId;
                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            setSelectedResumeId(r.id);
                            setShowResumeDropdown(false);
                          }}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isUploaded ? (
                              <>
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                                  {r.content?.fileType === 'pdf' ? (
                                    <FileText
                                      size={12}
                                      className="text-amber-600"
                                    />
                                  ) : (
                                    <ImageIcon
                                      size={12}
                                      className="text-amber-600"
                                    />
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                                  <FileText
                                    size={12}
                                    className="text-blue-600"
                                  />
                                </div>
                              </>
                            )}
                            <span className="text-xs text-gray-800 truncate">
                              {r.title}
                            </span>
                          </div>
                          {isUploaded && !sessionId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResume(r.id);
                              }}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {resumes.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-gray-500">
                        暂无简历，请先导入或创建
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Select
              data={[
                { label: '通用岗位（系统 Rubric）', value: 'general' },
                ...jobProfiles.map((profile) => ({
                  label: `${profile.jobTitle}${profile.company ? ` · ${profile.company}` : ''}（v${profile.version}）`,
                  value: profile.id,
                })),
              ]}
              value={selectedJobProfileId || 'general'}
              onChange={(value) => {
                const profile = jobProfiles.find((item) => item.id === value);
                setSelectedJobProfileId(profile?.id || null);
                setTargetPosition(profile?.jobTitle || '');
              }}
              size="xs"
              className="w-64"
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
          <div className="flex items-center gap-3 flex-shrink-0">
            {sessionId && (
              <div className="w-32">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>进度</span>
                  <span>
                    {answers.length}/{questionCount}
                  </span>
                </div>
                <Progress
                  value={
                    parseInt(questionCount) > 0
                      ? (answers.length / parseInt(questionCount)) * 100
                      : 0
                  }
                  size="xs"
                  radius="xl"
                />
              </div>
            )}
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
                  onClick={() => navigate('/interviews/history')}
                >
                  面试记录
                </Button>
                <Button
                  size="xs"
                  leftSection={<Play size={14} />}
                  onClick={handleStartInterview}
                  loading={starting}
                  disabled={
                    !selectedResumeId ||
                    !resumes.some((item) => item.id === selectedResumeId)
                  }
                  title={
                    selectedResumeId
                      ? '开始模拟面试'
                      : '请先创建或导入一份简历'
                  }
                >
                  开始面试
                </Button>
                {resumes.length === 0 && (
                  <Text size="xs" c="orange">
                    请先创建或导入简历
                  </Text>
                )}
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
        <nav aria-label="面试辅助面板" className="flex w-[72px] flex-shrink-0 flex-col items-center gap-2 border-r border-[#D8E1DD] bg-[#EAF0ED] py-4">
          {[
            { key: 'resume' as const, label: '简历', icon: FileText },
            { key: 'job' as const, label: '岗位', icon: BriefcaseBusiness },
            { key: 'transcript' as const, label: '记录', icon: ListChecks },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" aria-pressed={activeWorkspacePanel === key}
              onClick={() => setActiveWorkspacePanel(key)}
              className={`flex w-14 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/40 ${activeWorkspacePanel === key ? 'bg-white text-[#176B52] shadow-sm' : 'text-[#52635C] hover:bg-white/60 hover:text-[#17211D]'}`}>
              <Icon size={17} /><span>{label}</span>
            </button>
          ))}
        </nav>

        {/* 左侧辅助面板：仅控制布局，不修改面试会话 */}
        <div
          ref={interviewPreviewRef}
          className="w-[42%] min-w-[320px] max-w-[620px] flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-hidden"
        >
          {activeWorkspacePanel === 'job' ? (
            <div className="h-full overflow-y-auto bg-[#F8FAF9] p-6">
              {selectedJobProfileId ? (() => {
                const profile = jobProfiles.find((item) => item.id === selectedJobProfileId);
                if (!profile) return null;
                return <div className="mx-auto max-w-lg">
                  <Text size="xs" fw={700} className="tracking-[0.12em] text-[#176B52]">FROZEN JOB PROFILE</Text>
                  <Text fw={700} size="xl" mt={8}>{profile.jobTitle}</Text>
                  <Text size="sm" c="dimmed" mt={4}>{[profile.company, profile.seniority, profile.industry].filter(Boolean).join(' · ')} · v{profile.version}</Text>
                  {[['核心职责', profile.responsibilities], ['必备能力', profile.requiredSkills], ['加分项', profile.preferredSkills]].map(([title, items]) => (
                    <section key={String(title)} className="mt-7 border-t border-[#D8E1DD] pt-5">
                      <Text fw={700} size="sm">{String(title)}</Text>
                      <div className="mt-3 space-y-3">{(items as any[]).map((item, index) => <div key={index} className="rounded-lg bg-white p-3 shadow-sm"><Text size="sm" fw={600}>{item.name}</Text><Text size="xs" c="dimmed" mt={4}>{item.evidence}</Text></div>)}</div>
                    </section>
                  ))}
                </div>;
              })() : <div className="flex h-full flex-col items-center justify-center text-center"><BriefcaseBusiness size={30} className="text-[#7C9289]"/><Text fw={700} mt={12}>通用岗位</Text><Text size="sm" c="dimmed" mt={6}>本场使用系统通用 Rubric，不引用具体 JD。</Text></div>}
            </div>
          ) : activeWorkspacePanel === 'transcript' ? (
            <div className="h-full overflow-y-auto bg-[#F8FAF9] p-5">
              <Text size="xs" fw={700} className="tracking-[0.12em] text-[#176B52]">INTERVIEW TRANSCRIPT</Text>
              <Text fw={700} size="lg" mt={6}>本场记录</Text>
              <div className="mt-5 space-y-4">{questions.map((question, index) => {
                const answer = answers.find((item) => item.questionId === question.id);
                return <button key={question.id} type="button" className="w-full rounded-lg border border-[#D8E1DD] bg-white p-4 text-left transition hover:border-[#8FB3A5]">
                  <Text size="xs" c="dimmed">问题 {index + 1} · {getSectionName(question.sectionKey)}</Text>
                  <Text size="sm" fw={600} mt={6} lineClamp={2}>{question.content}</Text>
                  <Text size="xs" mt={8} c={answer ? 'teal' : 'dimmed'}>{answer ? '已回答' : index === questions.length - 1 ? '当前问题' : '未回答'}</Text>
                </button>;
              })}</div>
            </div>
          ) : resume?.content?.isUploadedFile && resume.content.fileUrl ? (
            <div className="relative flex h-full flex-col bg-slate-100 p-4">
              <div className="relative min-h-0 flex-1 overflow-hidden">
                {importedPreviewLoading && !importedPreviewError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader size="sm" />
                      正在加载简历预览…
                    </div>
                  </div>
                )}
                {importedPreviewError ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="max-w-sm rounded-xl border border-amber-200 bg-white p-6 text-center shadow-sm">
                      <FileText size={28} className="mx-auto mb-3 text-amber-500" />
                      <Text fw={600} size="sm" c="dark">
                        导入简历原文件不可用
                      </Text>
                      <Text size="xs" c="dimmed" mt={6} className="leading-5">
                        文件可能由旧版本保存到了临时容器中，请删除这条导入记录后重新上传。
                      </Text>
                    </div>
                  </div>
                ) : (
                  <img
                    key={`${resume.id}-${uploadedPdfPage}`}
                    src={
                      resume.content.fileType === 'pdf'
                        ? `${import.meta.env.VITE_API_BASE_URL}/api/upload/resume/${resume.id}/preview?page=${uploadedPdfPage}`
                        : `${import.meta.env.VITE_API_BASE_URL}/api/upload/resume/${resume.id}/file`
                    }
                    alt={`${resume.title}预览`}
                    className="h-full w-full object-contain shadow-sm"
                    onLoad={() => setImportedPreviewLoading(false)}
                    onError={() => {
                      setImportedPreviewLoading(false);
                      setImportedPreviewError(true);
                    }}
                  />
                )}
              </div>
              {resume.content.fileType === 'pdf' &&
                !importedPreviewError &&
                (resume.content.pageCount || 1) > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <Button
                      variant="subtle"
                      size="xs"
                      leftSection={<ChevronLeft size={15} />}
                      disabled={uploadedPdfPage <= 1}
                      onClick={() => setUploadedPdfPage((page) => Math.max(1, page - 1))}
                    >
                      上一页
                    </Button>
                    <Text size="sm" c="dimmed">
                      {uploadedPdfPage} / {resume.content.pageCount || 1}
                    </Text>
                    <Button
                      variant="subtle"
                      size="xs"
                      rightSection={<ChevronRight size={15} />}
                      disabled={uploadedPdfPage >= (resume.content.pageCount || 1)}
                      onClick={() => setUploadedPdfPage((page) => Math.min(resume.content.pageCount || 1, page + 1))}
                    >
                      下一页
                    </Button>
                  </div>
                )}
            </div>
          ) : (
            <div className="h-full p-4 overflow-hidden">
              <ResizableResumePreview
                content={resume?.content || null}
                highlightSection={currentQuestion?.sectionKey}
                className="w-full h-full"
              />
            </div>
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
