import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Loader, Modal, Text } from '@mantine/core';
import { CheckCircle2, Lock, PanelRightOpen } from 'lucide-react';
import { InterviewChat, InterviewNotesPanel, InterviewReport } from '@/components/interview';
import InterviewResumePreview from '@/components/interview/InterviewResumePreview';
import InterviewToolbar from '@/components/interview/InterviewToolbar';
import InterviewTranscriptPanel from '@/components/interview/InterviewTranscriptPanel';
import JobProfilePanel from '@/components/interview/JobProfilePanel';
import InterviewToolTabs from '@/components/interview/InterviewToolTabs';
import { useInterviewResources } from '@/hooks/useInterviewResources';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useInterviewWorkspace } from '@/hooks/useInterviewWorkspace';
import { useUserStore } from '@/store/useUserStore';

const sectionNames: Record<string, string> = {
  basicInfo: '基本信息', experience: '工作经历', projects: '项目经历', skills: '技能',
  education: '教育经历', careerObjective: '职业目标', certifications: '证书', campusExperiences: '校园经历',
};
const getSectionName = (key: string) => sectionNames[key] || key;
const INTERVIEW_TOOL_MIN_WIDTH = 340;
const INTERVIEW_TOOL_MAX_WIDTH = 800;

export default function InterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resumeId } = useParams<{ resumeId?: string }>();
  const [searchParams] = useSearchParams();
  const { user, isGuest } = useUserStore();
  const resources = useInterviewResources(user?.id, resumeId);
  const interview = useInterviewSession();
  const workspace = useInterviewWorkspace(interview.sessionId);

  const [questionCount, setQuestionCount] = useState('5');
  const [pdfPage, setPdfPage] = useState(1);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [toolWidth, setToolWidth] = useState(() => Math.min(INTERVIEW_TOOL_MAX_WIDTH, Math.max(INTERVIEW_TOOL_MIN_WIDTH, Number(localStorage.getItem('resume-pilot:interview-tool-width')) || 520)));
  const [resizing, setResizing] = useState(false);
  const [reportReadyOpen, setReportReadyOpen] = useState(false);
  const announcedReportId = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPdfPage(1); setPreviewError(false); setPreviewLoading(Boolean(resources.resume?.content?.isUploadedFile));
  }, [resources.resume?.id]);
  useEffect(() => {
    if (resources.resume?.content?.isUploadedFile) { setPreviewError(false); setPreviewLoading(true); }
  }, [pdfPage, resources.resume?.content?.isUploadedFile, resources.resume?.id]);
  useEffect(() => {
    if (interview.sessionResumeId) resources.setSelectedResumeId(interview.sessionResumeId);
    if (interview.sessionId) setQuestionCount(String(interview.maxQuestions));
  }, [interview.maxQuestions, interview.sessionId, interview.sessionResumeId, resources.setSelectedResumeId]);
  useEffect(() => {
    if (!resizing) return;
    const resize = (event: MouseEvent) => setToolWidth(Math.min(INTERVIEW_TOOL_MAX_WIDTH, Math.max(INTERVIEW_TOOL_MIN_WIDTH, window.innerWidth - event.clientX)));
    const stop = () => { setResizing(false); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', resize); window.addEventListener('mouseup', stop);
    return () => { window.removeEventListener('mousemove', resize); window.removeEventListener('mouseup', stop); };
  }, [resizing]);
  useEffect(() => { localStorage.setItem('resume-pilot:interview-tool-width', String(toolWidth)); }, [toolWidth]);
  useEffect(() => {
    const result = interview.interviewResult;
    if (result?.status === 'completed' && result.report && announcedReportId.current !== result.id) {
      announcedReportId.current = result.id;
      setReportReadyOpen(true);
    }
  }, [interview.interviewResult]);

  if (resources.loading || interview.restoring) return <div className="flex h-[calc(100vh-4rem)] items-center justify-center"><Loader size="xl" color="#176B52" /></div>;

  if (isGuest) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-canvas px-6">
        <div className="w-full max-w-[460px] rounded-[8px] border border-border bg-surface p-6 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Lock size={20} />
          </div>
          <h1 className="mt-5 text-lg font-semibold text-ink">模拟面试需要登录后使用</h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            展示模式可以查看页面结构，但生成问题、保存问答和输出报告需要登录后启用。
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth/login', { state: { from: location.pathname } })}
            className="mt-5 h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-contrast transition hover:bg-brand-hover"
          >
            登录后使用
          </button>
        </div>
      </div>
    );
  }

  const selectedResume = resources.resumes.find((item) => item.id === resources.selectedResumeId);
  const selectedProfile = resources.jobProfiles.find((item) => item.id === resources.selectedJobProfileId);
  const startInterview = () => {
    if (!selectedResume) return;
    interview.start({ resumeId: selectedResume.id, targetPosition: selectedProfile?.jobTitle,
      questionCount: Number(questionCount), jobProfileId: selectedProfile?.id, practiceTopic: searchParams.get('practice') || undefined });
  };
  return <div className="flex h-[calc(100vh-4rem)] flex-col bg-canvas text-ink">
    <Modal opened={reportReadyOpen} onClose={() => setReportReadyOpen(false)} centered radius="lg" title={<span className="font-semibold text-[#17211D]">面试报告已生成</span>} overlayProps={{ backgroundOpacity: 0.42, blur: 2 }}>
      <div className="pb-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F3EE] text-[#176B52]"><CheckCircle2 size={26}/></div>
        <Text mt="md" fw={600}>四维能力评价已完成</Text>
        <Text mt={6} size="sm" c="dimmed">查看技术深度、项目阐述、表达沟通和问题解决的得分与证据。</Text>
        <div className="mt-6 flex justify-end gap-3"><Button variant="subtle" color="gray" onClick={() => setReportReadyOpen(false)}>稍后查看</Button><Button color="#176B52" onClick={() => { setReportReadyOpen(false); navigate(`/interviews/results/${interview.interviewResult?.id}`); }}>查看报告</Button></div>
      </div>
    </Modal>
    <div className="flex flex-1 overflow-hidden">
      <main className="relative flex min-w-0 flex-1 flex-col bg-surface-muted"><div className="min-h-0 flex-1">
        {interview.isFinished ? interview.interviewResult?.status === 'failed'
          ? <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"><Text fw={700} size="lg">报告生成失败</Text><Text size="sm" c="dimmed">完整问题和回答已经保存，不需要重新面试。</Text><Button onClick={interview.retryReport} loading={interview.finishing}>重新生成报告</Button></div>
          : <InterviewReport result={interview.interviewResult} questions={interview.questions} answers={interview.answers}
              generating={interview.finishing && !interview.interviewResult} onRestart={interview.restart} onBackHome={() => navigate('/resumes')}
              onImproveResume={(question) => navigate(`/resumes/${interview.sessionResumeId || resources.selectedResumeId}/edit?section=${encodeURIComponent(question.sectionKey)}`)}
              onPractice={(_question, topic) => { interview.restart(); navigate(`/interviews/resume/${interview.sessionResumeId || resources.selectedResumeId}?practice=${encodeURIComponent(topic)}`); }} />
          : <InterviewChat questions={interview.questions} answers={interview.answers} currentQuestion={interview.currentQuestion}
              currentAnswer={interview.currentAnswer} submitting={interview.submitting} isThinking={interview.isThinking}
              streamStage={interview.streamStage}
              onAnswerChange={interview.setCurrentAnswer} onSubmitAnswer={interview.submitAnswer} getSectionName={getSectionName}
              sessionStarted={Boolean(interview.sessionId)} nextQuestionFailed={interview.nextQuestionFailed}
              onStart={startInterview} starting={interview.starting} canStart={Boolean(selectedResume)}
              onRetryNextQuestion={interview.retryNextQuestion} controls={<InterviewToolbar resumes={resources.resumes} selectedResumeId={resources.selectedResumeId}
                jobProfiles={resources.jobProfiles} selectedJobProfileId={resources.selectedJobProfileId} questionCount={questionCount}
                sessionId={interview.sessionId} answerCount={interview.answers.length} finishing={interview.finishing}
                uploading={resources.uploading} fileInputRef={fileInputRef}
                onSelectResume={(id) => resources.setSelectedResumeId(id)}
                onSelectJobProfile={resources.setSelectedJobProfileId} onQuestionCountChange={setQuestionCount} onFileUpload={resources.uploadResume}
                onFinish={() => interview.finish()} />} />}
      </div></main>

      {workspace.collapsed && <button type="button" onClick={() => workspace.selectPanel('resume')} aria-label="展开侧边栏" title="展开侧边栏" className="group absolute right-3 top-[calc(4rem+12px)] z-20 flex h-9 items-center overflow-hidden rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-muted shadow-sm transition-all hover:border-border-strong hover:bg-surface-raised focus-visible:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"><PanelRightOpen size={15} className="shrink-0"/><span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-1.5 group-hover:max-w-24 group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:max-w-24 group-focus-visible:opacity-100">展开侧边栏</span></button>}
      {!workspace.collapsed && <div role="separator" aria-orientation="vertical" aria-label="调整工具区域宽度" onMouseDown={() => setResizing(true)} className={`group relative z-30 w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-brand ${resizing ? 'bg-brand' : ''}`}><span className="absolute left-1/2 top-1/2 h-12 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent group-hover:bg-brand/15"/></div>}
      <aside aria-hidden={workspace.collapsed} style={{ width: workspace.collapsed ? 0 : toolWidth }} className={`shrink-0 overflow-hidden bg-surface ${resizing ? '' : 'transition-[width,opacity] duration-300 ease-out motion-reduce:transition-none'} ${workspace.collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        <div style={{ width: toolWidth }} className="h-full min-w-[340px]">
        <InterviewToolTabs activePanel={workspace.activePanel} onSelect={workspace.selectPanel} onCollapse={workspace.toggleCollapsed}/>
        <div className="h-[calc(100%-3rem)]">
        {workspace.activePanel === 'job' ? <JobProfilePanel profile={selectedProfile} />
          : workspace.activePanel === 'transcript' ? <InterviewTranscriptPanel questions={interview.questions} answers={interview.answers} getSectionName={getSectionName} />
          : workspace.activePanel === 'notes' ? <InterviewNotesPanel notes={workspace.notes} sessionStarted={Boolean(interview.sessionId)} onChange={workspace.setNotes} />
          : <InterviewResumePreview resume={resources.resume} highlightSection={interview.currentQuestion?.sectionKey} pdfPage={pdfPage}
              loading={previewLoading} error={previewError} onPageChange={setPdfPage} onLoad={() => setPreviewLoading(false)}
              onError={() => { setPreviewLoading(false); setPreviewError(true); }} />}
        </div>
        </div>
      </aside>
    </div>
  </div>;
}
