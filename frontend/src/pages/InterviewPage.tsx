import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Loader, Text } from '@mantine/core';
import { InterviewChat, InterviewNotesPanel, InterviewReport } from '@/components/interview';
import InterviewResumePreview from '@/components/interview/InterviewResumePreview';
import InterviewToolbar from '@/components/interview/InterviewToolbar';
import InterviewTranscriptPanel from '@/components/interview/InterviewTranscriptPanel';
import InterviewWorkspaceRail from '@/components/interview/InterviewWorkspaceRail';
import JobProfilePanel from '@/components/interview/JobProfilePanel';
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
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [pdfPage, setPdfPage] = useState(1);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPdfPage(1); setPreviewError(false); setPreviewLoading(Boolean(resources.resume?.content?.isUploadedFile));
  }, [resources.resume?.id]);
  useEffect(() => {
    if (resources.resume?.content?.isUploadedFile) { setPreviewError(false); setPreviewLoading(true); }
  }, [pdfPage, resources.resume?.content?.isUploadedFile, resources.resume?.id]);
  useEffect(() => {
    if (!showResumeDropdown) return;
    const close = (event: MouseEvent) => { if (!(event.target as HTMLElement).closest('.resume-dropdown-container')) setShowResumeDropdown(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, [showResumeDropdown]);
  useEffect(() => {
    if (interview.sessionResumeId) resources.setSelectedResumeId(interview.sessionResumeId);
    if (interview.sessionId) setQuestionCount(String(interview.maxQuestions));
  }, [interview.maxQuestions, interview.sessionId, interview.sessionResumeId, resources.setSelectedResumeId]);

  if (resources.loading || interview.restoring) return <div className="flex h-[calc(100vh-4rem)] items-center justify-center"><Loader size="xl" /></div>;

  const selectedResume = resources.resumes.find((item) => item.id === resources.selectedResumeId);
  const selectedProfile = resources.jobProfiles.find((item) => item.id === resources.selectedJobProfileId);
  const startInterview = () => {
    if (!selectedResume) return;
    interview.start({ resumeId: selectedResume.id, targetPosition: selectedProfile?.jobTitle,
      questionCount: Number(questionCount), jobProfileId: selectedProfile?.id, practiceTopic: searchParams.get('practice') || undefined });
  };

  return <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#F4F7F6]">
    <InterviewToolbar resumes={resources.resumes} selectedResumeId={resources.selectedResumeId} showResumeDropdown={showResumeDropdown}
      jobProfiles={resources.jobProfiles} selectedJobProfileId={resources.selectedJobProfileId} questionCount={questionCount}
      sessionId={interview.sessionId} answerCount={interview.answers.length} starting={interview.starting} finishing={interview.finishing}
      uploading={resources.uploading} fileInputRef={fileInputRef} onToggleResumeDropdown={() => setShowResumeDropdown((value) => !value)}
      onSelectResume={(id) => { resources.setSelectedResumeId(id); setShowResumeDropdown(false); }} onDeleteResume={resources.deleteResume}
      onSelectJobProfile={resources.setSelectedJobProfileId} onQuestionCountChange={setQuestionCount} onFileUpload={resources.uploadResume}
      onOpenHistory={() => navigate('/interviews/history')} onStart={startInterview} onFinish={() => interview.finish()} />

    <div className="flex flex-1 overflow-hidden">
      <InterviewWorkspaceRail activePanel={workspace.activePanel} collapsed={workspace.collapsed}
        onSelect={workspace.selectPanel} onToggleCollapsed={workspace.toggleCollapsed} />
      <aside className={`${workspace.collapsed ? 'hidden' : 'w-[42%] min-w-[320px] max-w-[620px]'} flex-shrink-0 overflow-hidden border-r border-gray-200 bg-gray-50`}>
        {workspace.activePanel === 'job' ? <JobProfilePanel profile={selectedProfile} />
          : workspace.activePanel === 'transcript' ? <InterviewTranscriptPanel questions={interview.questions} answers={interview.answers} getSectionName={getSectionName} />
          : workspace.activePanel === 'notes' ? <InterviewNotesPanel notes={workspace.notes} sessionStarted={Boolean(interview.sessionId)} onChange={workspace.setNotes} />
          : <InterviewResumePreview resume={resources.resume} highlightSection={interview.currentQuestion?.sectionKey} pdfPage={pdfPage}
              loading={previewLoading} error={previewError} onPageChange={setPdfPage} onLoad={() => setPreviewLoading(false)}
              onError={() => { setPreviewLoading(false); setPreviewError(true); }} />}
      </aside>

      <main className="flex flex-1 flex-col bg-white"><div className="flex-1 overflow-y-auto p-4">
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
              onRetryNextQuestion={interview.retryNextQuestion} />}
      </div></main>
    </div>
  </div>;
}
