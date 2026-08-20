import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Check, FileText, Loader2, RefreshCw, Save, Sparkles, Target, Trash2 } from 'lucide-react';
import { jobApi } from '@/api/job.api';
import { resumeApi } from '@/api/home.api';
import { notification } from '@/components/common/Notification';
import { getApiErrorMessage } from '@/utils/api-error';
import type {
  EditableJobProfile,
  AtsAnalysisResult,
  JobDescription,
  JobProfile,
  JobMatchAnalysis,
} from '@/types/job';
import type { Resume } from '@/types/resume';
import type { ContentQualityAnalysis } from '@/types/content-quality';
import RequirementEditor from '@/components/job-center/RequirementEditor';
import JobSidebar from '@/components/job-center/JobSidebar';
import CreateJobPanel, { type CreateProgress } from '@/components/job-center/CreateJobPanel';
import AtsAnalysisPanel from '@/components/job-center/AtsAnalysisPanel';
import ContentQualityPanel from '@/components/job-center/ContentQualityPanel';
import JobMatchPanel from '@/components/job-center/JobMatchPanel';
import { useUserStore } from '@/store/useUserStore';
const toEditable = (profile: JobProfile): EditableJobProfile => ({
  jobTitle: profile.jobTitle,
  seniority: profile.seniority || '',
  industry: profile.industry || '',
  responsibilities: profile.responsibilities,
  requiredSkills: profile.requiredSkills,
  preferredSkills: profile.preferredSkills,
  keywords: profile.keywords,
});

export default function JobCenterPage() {
  const { isGuest } = useUserStore();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<JobProfile | null>(null);
  const [profileVersions, setProfileVersions] = useState<JobProfile[]>([]);
  const [draft, setDraft] = useState<EditableJobProfile | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [rawText, setRawText] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [createProgress, setCreateProgress] = useState<CreateProgress>('idle');
  const [createError, setCreateError] = useState('');
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'profile' | 'match'>('profile');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [atsResult, setAtsResult] = useState<AtsAnalysisResult | null>(null);
  const [atsBusy, setAtsBusy] = useState(false);
  const [analysisView, setAnalysisView] = useState<'structure' | 'quality' | 'match'>('structure');
  const [contentQuality, setContentQuality] = useState<ContentQualityAnalysis | null>(null);
  const [qualityBusy, setQualityBusy] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchAnalysis | null>(null);
  const [matchBusy, setMatchBusy] = useState(false);

  const selected = useMemo(
    () => jobs.find((job) => job.id === selectedId) || null,
    [jobs, selectedId]
  );

  const loadLatestContentQuality = async (resumeId: string) => {
    if (!resumeId) {
      setContentQuality(null);
      return;
    }
    try {
      const response = await resumeApi.getLatestContentQuality(resumeId);
      if (response.code !== 200) throw new Error(response.message);
      setContentQuality(response.data);
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '最近内容质量报告加载失败'));
    }
  };

  const loadLatestMatch = async (jobId: string, resumeId: string) => {
    if (!jobId || !resumeId) { setMatchResult(null); return; }
    try {
      const response = await jobApi.getLatestMatch(jobId, resumeId);
      if (response.code !== 200) throw new Error(response.message);
      setMatchResult(response.data);
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '最近岗位匹配报告加载失败'));
    }
  };

  const showProfile = (nextProfile: JobProfile | null) => {
    setProfile(nextProfile);
    setDraft(nextProfile ? toEditable(nextProfile) : null);
  };

  const loadProfiles = async (jobId: string, preferredProfileId?: string) => {
    const response = await jobApi.listProfiles(jobId);
    if (response.code !== 200) throw new Error(response.message);
    setProfileVersions(response.data);
    const nextProfile =
      response.data.find((item) => item.id === preferredProfileId) ||
      response.data[0] ||
      null;
    showProfile(nextProfile);
  };

  const loadJobs = async (preferredId?: string) => {
    try {
      const response = await jobApi.list();
      if (response.code !== 200) throw new Error(response.message);
      setJobs(response.data);
      const nextId =
        (preferredId && response.data.some((job) => job.id === preferredId) ? preferredId : null) ||
        (selectedId && response.data.some((job) => job.id === selectedId) ? selectedId : null) ||
        response.data[0]?.id ||
        null;
      setSelectedId(nextId);
      if (nextId) {
        await loadProfiles(nextId);
      } else {
        setProfileVersions([]);
        showProfile(null);
      }
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '目标岗位加载失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGuest) {
      setLoading(false);
      return;
    }
    void loadJobs();
    void resumeApi.getUserResumes({ excludeUploaded: true }).then((response) => {
      if (response.code !== 200) throw new Error(response.message);
      setResumes(response.data);
      const initialResumeId = response.data[0]?.id || '';
      setSelectedResumeId(initialResumeId);
      if (initialResumeId) void loadLatestContentQuality(initialResumeId);
    }).catch((cause) => notification.error(getApiErrorMessage(cause, '简历列表加载失败')));
  }, [isGuest]);

  useEffect(() => {
    if (selectedId && selectedResumeId) void loadLatestMatch(selectedId, selectedResumeId);
  }, [selectedId, selectedResumeId]);

  const selectJob = async (job: JobDescription) => {
    if (busy) return;
    setSelectedId(job.id);
    setProfileVersions([]);
    showProfile(job.latestProfile || null);
    setShowCreate(false);
    setWorkspaceTab('profile');
    setAtsResult(null);
    try {
      await loadProfiles(job.id);
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '岗位画像版本加载失败'));
    }
  };

  const openCreate = () => {
    if (busy) return;
    setShowCreate(true);
    setCreateProgress('idle');
    setCreateError('');
    setSavedJobId(null);
    setRawText('');
    setTitle('');
    setCompany('');
  };

  const closeCreate = () => {
    if (busy) return;
    setShowCreate(false);
    setCreateProgress('idle');
    setCreateError('');
    setSavedJobId(null);
  };

  const createAndAnalyze = async () => {
    if (rawText.trim().length < 30) {
      notification.error('请粘贴完整的 JD，至少 30 个字符');
      return;
    }
    setBusy(true);
    setCreateError('');
    let createdJobId = savedJobId || undefined;
    try {
      if (!createdJobId) {
        setCreateProgress('saving');
        const created = await jobApi.create({ title, company, rawText });
        if (created.code !== 200) throw new Error(created.message);
        createdJobId = created.data.id;
        setSavedJobId(createdJobId);
        setSelectedId(createdJobId);
      }

      setCreateProgress('analyzing');
      const analyzed = await jobApi.analyze(createdJobId);
      if (analyzed.code !== 200) throw new Error(analyzed.message);
      await loadJobs(createdJobId);
      setShowCreate(false);
      setCreateProgress('idle');
      setSavedJobId(null);
      setRawText('');
      setTitle('');
      setCompany('');
      notification.success('JD 已保存，岗位画像已生成');
    } catch (cause) {
      const message = getApiErrorMessage(
        cause,
        createdJobId
          ? 'JD 已保存，但岗位画像生成失败，请稍后重试'
          : 'JD 保存失败，请稍后重试'
      );
      setCreateProgress('error');
      setCreateError(message);
      notification.error(message);
      await loadJobs(createdJobId);
    } finally {
      setBusy(false);
    }
  };

  const analyze = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const response = await jobApi.analyze(selected.id);
      if (response.code !== 200) throw new Error(response.message);
      notification.success(`岗位画像 V${response.data.version} 已生成`);
      await loadJobs(selected.id);
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '岗位画像生成失败'));
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!selected || !profile || !draft) return;
    setBusy(true);
    try {
      const response = await jobApi.updateProfile(selected.id, profile.id, draft);
      if (response.code !== 200) throw new Error(response.message);
      notification.success('岗位画像已保存');
      await loadJobs(selected.id);
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '岗位画像保存失败'));
    } finally {
      setBusy(false);
    }
  };

  const confirmProfile = async () => {
    if (!selected || !profile) return;
    setBusy(true);
    try {
      if (draft) {
        const saved = await jobApi.updateProfile(selected.id, profile.id, draft);
        if (saved.code !== 200) throw new Error(saved.message);
      }
      const response = await jobApi.confirmProfile(selected.id, profile.id);
      if (response.code !== 200) throw new Error(response.message);
      notification.success('岗位画像已确认，可用于后续 ATS 与模拟面试');
      await loadJobs(selected.id);
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '岗位画像确认失败'));
    } finally {
      setBusy(false);
    }
  };

  const removeJob = async () => {
    if (!selected || !window.confirm('确定删除这个目标岗位吗？')) return;
    await jobApi.remove(selected.id);
    setSelectedId(null);
    setProfileVersions([]);
    showProfile(null);
    await loadJobs();
  };

  const runAtsAnalysis = async () => {
    if (!selected || !selectedResumeId) {
      notification.error('请先选择一份简历');
      return;
    }
    setAtsBusy(true);
    try {
      const response = await jobApi.analyzeAts(selected.id, selectedResumeId);
      if (response.code !== 200) throw new Error(response.message);
      setAtsResult(response.data);
      setAnalysisView('structure');
      notification.success('ATS 基础分析完成');
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, 'ATS 基础分析失败'));
    } finally {
      setAtsBusy(false);
    }
  };

  const runContentQuality = async () => {
    if (!selectedResumeId) {
      notification.error('请先选择一份简历');
      return;
    }
    setQualityBusy(true);
    try {
      const response = await resumeApi.analyzeContentQuality(selectedResumeId);
      if (response.code !== 200) throw new Error(response.message);
      setContentQuality(response.data);
      setAnalysisView('quality');
      notification.success('AI 内容质量评价完成');
    } catch (cause) {
      notification.error(getApiErrorMessage(cause, '内容质量评价失败'));
    } finally {
      setQualityBusy(false);
    }
  };

  const runJobMatch = async () => {
    if (!selected || !selectedResumeId) return notification.error('请先选择一份简历');
    if (!profileVersions.some((item) => item.status === 'confirmed')) return notification.error('请先确认当前岗位画像');
    setMatchBusy(true);
    try {
      const response = await jobApi.analyzeMatch(selected.id, selectedResumeId);
      if (response.code !== 200) throw new Error(response.message);
      setMatchResult(response.data); setAnalysisView('match'); notification.success('岗位匹配完成');
    } catch (cause) { notification.error(getApiErrorMessage(cause, '岗位匹配失败')); }
    finally { setMatchBusy(false); }
  };

  if (loading) {
    return <div className="flex min-h-[480px] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (isGuest) {
    return (
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-center px-6">
        <div className="w-full max-w-[520px] rounded-[8px] border border-[#D8E1DD] bg-white p-6 text-center shadow-sm">
          <Target className="mx-auto text-[#176B52]" size={24} />
          <h1 className="mt-4 text-lg font-semibold text-[#17211D]">岗位匹配需要登录后使用</h1>
          <p className="mt-2 text-sm leading-6 text-[#66736D]">
            展示模式不会保存 JD、生成岗位画像或调用 AI 匹配。登录后可以创建岗位、分析简历并查看历史结果。
          </p>
        </div>
      </div>
    );
  }

  const confirmed = profile?.status === 'confirmed';
  const hasConfirmedProfile = profileVersions.some((item) => item.status === 'confirmed');
  const editable = profile?.status === 'draft';
  const profileStatusLabel = profile?.status === 'confirmed'
    ? '当前确认'
    : profile?.status === 'superseded'
      ? '历史版本'
      : '待确认';

  return (
    <div className="mx-auto h-full max-w-[1440px] px-6">
      <div className="flex h-full min-h-0 gap-5">
      <JobSidebar jobs={jobs} selectedId={selectedId} onSelect={selectJob} onCreate={openCreate} disabled={busy} />

      <section className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6">
        {showCreate ? (
          <CreateJobPanel
            title={title}
            company={company}
            rawText={rawText}
            busy={busy}
            savedJobId={savedJobId}
            progress={createProgress}
            error={createError}
            onTitleChange={setTitle}
            onCompanyChange={setCompany}
            onRawTextChange={setRawText}
            onCancel={closeCreate}
            onSubmit={createAndAnalyze}
          />
        ) : selected ? (
          <div className="h-full">
            <nav className="mb-5 flex gap-6 border-b border-gray-200">
              <button onClick={() => setWorkspaceTab('profile')} className={`px-1 pb-3 text-sm font-medium ${workspaceTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>JD 与岗位画像</button>
              <button onClick={() => setWorkspaceTab('match')} className={`px-1 pb-3 text-sm font-medium ${workspaceTab === 'match' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>ATS 与岗位匹配</button>
            </nav>
            {workspaceTab === 'match' ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50/60 p-5">
                  <div className="min-w-[260px] flex-1">
                    <div className="flex items-center gap-2"><BarChart3 size={20} className="text-blue-600" /><h2 className="text-lg font-semibold text-gray-900">ATS 结构初检</h2></div>
                      <p className="mt-1 text-sm text-gray-500">从 0 分开始检查机器可读性和字段结构；内容质量、真实性与 JD 匹配会独立评价。</p>
                    <select
                      value={selectedResumeId}
                      onChange={(event) => { const resumeId = event.target.value; setSelectedResumeId(resumeId); setAtsResult(null); setContentQuality(null); setMatchResult(null); void loadLatestContentQuality(resumeId); }}
                      className="mt-4 w-full max-w-lg rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="">选择要分析的简历</option>
                      {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.title}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button disabled={atsBusy || qualityBusy || matchBusy || !selectedResumeId} onClick={runAtsAnalysis} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-medium text-gray-700 disabled:opacity-50">
                      {atsBusy ? <Loader2 size={17} className="animate-spin" /> : <FileText size={17} />}结构初检
                    </button>
                    <button disabled={atsBusy || qualityBusy || matchBusy || !selectedResumeId} onClick={runContentQuality} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white disabled:opacity-50">
                      {qualityBusy ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}AI 内容评价
                    </button>
                    <button disabled={atsBusy || qualityBusy || matchBusy || !selectedResumeId || !hasConfirmedProfile} onClick={runJobMatch} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white disabled:opacity-50">{matchBusy ? <Loader2 size={17} className="animate-spin" /> : <BarChart3 size={17} />}岗位匹配</button>
                  </div>
                </div>

                {!hasConfirmedProfile && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">ATS 基础体检可以直接使用；JD 岗位匹配需要先确认岗位画像。</p>}

                {(atsResult || contentQuality || matchResult) && (
                  <nav className="flex gap-5 border-b border-gray-200">
                    <button onClick={() => setAnalysisView('structure')} className={`pb-2 text-sm font-medium ${analysisView === 'structure' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>ATS 结构分</button>
                    <button onClick={() => setAnalysisView('quality')} className={`pb-2 text-sm font-medium ${analysisView === 'quality' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>内容质量分</button>
                    <button onClick={() => setAnalysisView('match')} className={`pb-2 text-sm font-medium ${analysisView === 'match' ? 'border-b-2 border-violet-600 text-violet-600' : 'text-gray-500'}`}>岗位匹配分</button>
                  </nav>
                )}

                {analysisView === 'match'
                  ? <JobMatchPanel result={matchResult} />
                  : analysisView === 'quality'
                    ? <ContentQualityPanel result={contentQuality} />
                    : <AtsAnalysisPanel result={atsResult} />}
              </div>
            ) : (
          <div className="grid grid-cols-[minmax(300px,0.85fr)_minmax(420px,1.15fr)] gap-6">
            <div className="min-w-0 border-r border-gray-100 pr-6">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-xl font-bold">JD 原文</h2><p className="mt-1 text-sm text-gray-500">{selected.company || '未填写公司'}</p></div>
                <button onClick={removeJob} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
              <pre className="mt-5 max-h-[570px] overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-sans text-sm leading-7 text-gray-700">{selected.rawText}</pre>
            </div>

            <div className="min-w-0 overflow-auto pr-1">
              <div className="sticky top-0 z-10 mb-5 flex items-center justify-between bg-white pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">岗位画像</h2>
                    {profile && <span className={`rounded-full px-2 py-1 text-xs ${confirmed ? 'bg-green-100 text-green-700' : profile.status === 'superseded' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>V{profile.version} · {profileStatusLabel}</span>}
                    {profileVersions.length > 1 && (
                      <select
                        aria-label="切换岗位画像版本"
                        disabled={busy}
                        value={profile?.id || ''}
                        onChange={(event) => showProfile(profileVersions.find((item) => item.id === event.target.value) || null)}
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600"
                      >
                        {profileVersions.map((item) => (
                          <option key={item.id} value={item.id}>V{item.version} · {item.status === 'confirmed' ? '当前确认' : item.status === 'superseded' ? '历史版本' : '待确认'}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {profile && <p className="mt-1 text-xs text-gray-400">{profile.modelName} · {profile.promptVersion} · 整体置信度 {Math.round((profile.confidence || 0) * 100)}%</p>}
                </div>
                <div className="flex gap-2">
                  {profile && <button disabled={busy} onClick={analyze} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}重新分析</button>}
                  {profile && editable && <button disabled={busy} onClick={saveProfile} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"><Save size={15} />保存</button>}
                  {profile && editable && <button disabled={busy} onClick={confirmProfile} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm text-white"><Check size={15} />确认画像</button>}
                </div>
              </div>

              {!profile || !draft ? (
                <div className="rounded-lg border border-dashed py-24 text-center"><p className="text-gray-500">这个 JD 尚未完成岗位画像分析</p><p className="mt-2 text-sm text-gray-400">可能是模型配置、网络或结构化输出校验失败。</p><button disabled={busy} onClick={analyze} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{busy && <Loader2 size={16} className="animate-spin" />}重试分析</button></div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <label className="text-sm text-gray-500">岗位<input disabled={!editable} value={draft.jobTitle} onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-gray-800 disabled:bg-gray-50" /></label>
                    <label className="text-sm text-gray-500">职级/年限<input disabled={!editable} value={draft.seniority || ''} onChange={(e) => setDraft({ ...draft, seniority: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-gray-800 disabled:bg-gray-50" /></label>
                    <label className="text-sm text-gray-500">行业<input disabled={!editable} value={draft.industry || ''} onChange={(e) => setDraft({ ...draft, industry: e.target.value })} className="mt-1 w-full rounded border px-3 py-2 text-gray-800 disabled:bg-gray-50" /></label>
                  </div>
                  <RequirementEditor title="岗位职责" value={draft.responsibilities} disabled={!editable} onChange={(value) => setDraft({ ...draft, responsibilities: value })} />
                  <RequirementEditor title="必备能力" value={draft.requiredSkills} disabled={!editable} onChange={(value) => setDraft({ ...draft, requiredSkills: value })} />
                  <RequirementEditor title="加分项" value={draft.preferredSkills} disabled={!editable} onChange={(value) => setDraft({ ...draft, preferredSkills: value })} />
                  <section><h3 className="font-semibold text-gray-800">关键词</h3><textarea disabled={!editable} value={draft.keywords.join('、')} onChange={(e) => setDraft({ ...draft, keywords: e.target.value.split(/[、,，\n]/).map((v) => v.trim()).filter(Boolean).slice(0, 20) })} className="mt-2 min-h-20 w-full rounded border p-3 text-sm disabled:bg-gray-50" /></section>
                </div>
              )}
            </div>
          </div>
            )}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center"><h2 className="text-xl font-bold">建立你的目标岗位</h2><p className="mt-2 text-gray-500">从粘贴一份真实 JD 开始。</p><button onClick={openCreate} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white">添加 JD</button></div>
        )}
      </section>
      </div>
    </div>
  );
}
