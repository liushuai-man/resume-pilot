import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Loader, Text } from '@mantine/core';
import { PanelRightOpen } from 'lucide-react';
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

export default function InterviewPage() {
  const navigate = useNavigate();
  const { resumeId } = useParams<{ resumeId?: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useUserStore();
  const resources = useInterviewResources(user?.id, resumeId);
  const interview = useInterviewSession();
  const workspace = useInterviewWorkspace(interview.sessionId);

  const [questionCount, setQuestionCount] = useState('5');
  const [pdfPage, setPdfPage] = useState(1);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [toolWidth, setToolWidth] = useState(() => Number(localStorage.getItem('resume-pilot:interview-tool-width')) || 520);
  const [resizing, setResizing] = useState(false);
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
    const resize = (event: MouseEvent) => setToolWidth(Math.min(window.innerWidth - 80, Math.max(340, window.innerWidth - event.clientX)));
    const stop = () => { setResizing(false); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', resize); window.addEventListener('mouseup', stop);
    return () => { window.removeEventListener('mousemove', resize); window.removeEventListener('mouseup', stop); };
  }, [resizing]);
  useEffect(() => { localStorage.setItem('resume-pilot:interview-tool-width', String(toolWidth)); }, [toolWidth]);

  if (resources.loading || interview.restoring) return <div className="flex h-[calc(100vh-4rem)] items-center justify-center"><Loader size="xl" /></div>;

  const selectedResume = resources.resumes.find((item) => item.id === resources.selectedResumeId);
  const selectedProfile = resources.jobProfiles.find((item) => item.id === resources.selectedJobProfileId);
  const startInterview = () => {
    if (!selectedResume) return;
    interview.start({ resumeId: selectedResume.id, targetPosition: selectedProfile?.jobTitle,
      questionCount: Number(questionCount), jobProfileId: selectedProfile?.id, practiceTopic: searchParams.get('practice') || undefined });
  };
  return <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#F4F7F6]">
    <div className="flex flex-1 overflow-hidden">
      <main className="relative flex min-w-0 flex-1 flex-col bg-[#F7F9F8]"><div className="min-h-0 flex-1">
        {interview.isFinished ? interview.interviewResult?.status === 'failed'
          ? <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center"><Text fw={700} size="lg">报告生成失败</Text><Text size="sm" c="dimmed">完整问题和回答已经保存，不需要重新面试。</Text><Button onClick={interview.retryReport} loading={interview.finishing}>重新生成报告</Button></div>
          : <InterviewReport result={interview.interviewResult} questions={interview.questions} answers={interview.answers}
              generating={interview.finishing && !interview.interviewResult} onRestart={interview.restart} onBackHome={() => navigate('/resumes')}
              onImproveResume={(question) => navigate(`/resumes/${interview.sessionResumeId || resources.selectedResumeId}/edit?section=${encodeURIComponent(question.sectionKey)}`)}
              onPractice={(_question, topic) => { interview.restart(); navigate(`/interviews/resume/${interview.sessionResumeId || resources.selectedResumeId}?practice=${encodeURIComponent(topic)}`); }} />
          : <InterviewChat questions={interview.questions} answers={interview.answers} currentQuestion={interview.currentQuestion}
              currentAnswer={interview.currentAnswer} submitting={interview.submitting} isThinking={interview.isThinking}
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

      {workspace.collapsed && <button type="button" onClick={() => workspace.selectPanel('resume')} aria-label="展开侧边栏" title="展开侧边栏" className="group absolute right-3 top-[calc(4rem+12px)] z-20 flex h-9 items-center overflow-hidden rounded-lg border border-[#D8E1DD] bg-white px-2.5 text-xs font-medium text-[#52615B] shadow-sm transition-all hover:border-[#B9CAC3] hover:bg-[#F7F9F8] focus-visible:border-[#B9CAC3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/25"><PanelRightOpen size={15} className="shrink-0"/><span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-1.5 group-hover:max-w-24 group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:max-w-24 group-focus-visible:opacity-100">展开侧边栏</span></button>}
      {!workspace.collapsed && <div role="separator" aria-orientation="vertical" aria-label="调整工具区域宽度" onMouseDown={() => setResizing(true)} className={`group relative z-30 w-1 shrink-0 cursor-col-resize bg-[#D8E1DD] transition-colors hover:bg-[#176B52] ${resizing ? 'bg-[#176B52]' : ''}`}><span className="absolute left-1/2 top-1/2 h-12 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent group-hover:bg-[#176B52]/15"/></div>}
      <aside style={workspace.collapsed ? undefined : { width: toolWidth }} className={`${workspace.collapsed ? 'hidden' : ''} min-w-[340px] flex-shrink-0 overflow-hidden bg-white`}>
        <InterviewToolTabs activePanel={workspace.activePanel} onSelect={workspace.selectPanel} onCollapse={workspace.toggleCollapsed}/>
        <div className="h-[calc(100%-3rem)]">
        {workspace.activePanel === 'job' ? <JobProfilePanel profile={selectedProfile} />
          : workspace.activePanel === 'transcript' ? <InterviewTranscriptPanel questions={interview.questions} answers={interview.answers} getSectionName={getSectionName} />
          : workspace.activePanel === 'notes' ? <InterviewNotesPanel notes={workspace.notes} sessionStarted={Boolean(interview.sessionId)} onChange={workspace.setNotes} />
          : <InterviewResumePreview resume={resources.resume} highlightSection={interview.currentQuestion?.sectionKey} pdfPage={pdfPage}
              loading={previewLoading} error={previewError} onPageChange={setPdfPage} onLoad={() => setPreviewLoading(false)}
              onError={() => { setPreviewLoading(false); setPreviewError(true); }} />}
        </div>
      </aside>
    </div>
  </div>;
}
