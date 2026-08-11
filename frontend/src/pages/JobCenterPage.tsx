import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, Check, FileText, Loader2, Plus, RefreshCw, Save, Sparkles, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jobApi } from '@/api/job.api';
import { resumeApi } from '@/api/home.api';
import { notification } from '@/components/common/Notification';
import { getApiErrorMessage } from '@/utils/api-error';
import type {
  EditableJobProfile,
  AtsAnalysisResult,
  JobDescription,
  JobProfile,
  JobRequirement,
  JobMatchAnalysis,
} from '@/types/job';
import type { Resume } from '@/types/resume';
import PageHeader from '@/components/common/PageHeader';
import type { ContentQualityAnalysis } from '@/types/content-quality';

const emptyRequirement = (): JobRequirement => ({
  name: '',
  evidence: '',
  confidence: 1,
});

function RequirementEditor({
  title,
  value,
  disabled,
  onChange,
}: {
  title: string;
  value: JobRequirement[];
  disabled: boolean;
  onChange: (next: JobRequirement[]) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {!disabled && (
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => onChange([...value, emptyRequirement()])}
          >
            + 添加
          </button>
        )}
      </div>
      {value.length === 0 && (
        <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-400">未识别到相关内容</p>
      )}
      {value.map((item, index) => (
        <div key={index} className={`rounded-lg border p-3 ${item.confidence < 0.7 ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'}`}>
          <div className="flex gap-2">
            <input
              value={item.name}
              disabled={disabled}
              onChange={(event) => {
                const next = [...value];
                next[index] = { ...item, name: event.target.value };
                onChange(next);
              }}
              className="min-w-0 flex-1 rounded border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50"
              placeholder="要求摘要"
            />
            {!disabled && (
              <button
                type="button"
                aria-label="删除"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={17} />
              </button>
            )}
          </div>
          <textarea
            value={item.evidence}
            disabled={disabled}
            onChange={(event) => {
              const next = [...value];
              next[index] = { ...item, evidence: event.target.value };
              onChange(next);
            }}
            className="mt-2 min-h-16 w-full resize-y rounded border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:bg-gray-50"
            placeholder="对应的 JD 原文证据"
          />
          <p className={`mt-1 text-xs ${item.confidence < 0.7 ? 'font-medium text-amber-700' : 'text-gray-400'}`}>
            原始 AI 置信度 {Math.round(item.confidence * 100)}%
            {item.confidence < 0.7 ? ' · 需要重点确认' : ''}
          </p>
        </div>
      ))}
    </section>
  );
}

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
  const [createProgress, setCreateProgress] = useState<
    'idle' | 'saving' | 'analyzing' | 'error'
  >('idle');
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
    void loadJobs();
    void resumeApi.getUserResumes({ excludeUploaded: true }).then((response) => {
      if (response.code !== 200) throw new Error(response.message);
      setResumes(response.data);
      const initialResumeId = response.data[0]?.id || '';
      setSelectedResumeId(initialResumeId);
      if (initialResumeId) void loadLatestContentQuality(initialResumeId);
    }).catch((cause) => notification.error(getApiErrorMessage(cause, '简历列表加载失败')));
  }, []);

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

  const confirmed = profile?.status === 'confirmed';
  const hasConfirmedProfile = profileVersions.some((item) => item.status === 'confirmed');
  const editable = profile?.status === 'draft';
  const profileStatusLabel = profile?.status === 'confirmed'
    ? '当前确认'
    : profile?.status === 'superseded'
      ? '历史版本'
      : '待确认';

  return (
    <div className="mx-auto max-w-[1440px] px-6">
      <PageHeader eyebrow="TARGET JOBS" title="目标岗位" description="以确认后的岗位画像统一驱动简历评价、岗位匹配与模拟面试。" action={<button disabled={busy} onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17} />添加 JD</button>} />
      <div className="flex min-h-[680px] gap-5">
      <aside className="w-72 shrink-0 rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-4">
          <div><h1 className="text-lg font-bold">目标岗位</h1><p className="text-xs text-gray-500">{jobs.length} 个 JD</p></div>
        </div>
        <div className="space-y-2">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => selectJob(job)}
              className={`w-full rounded-lg border p-3 text-left ${selectedId === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
            >
              <p className="truncate font-medium text-gray-800">{job.latestProfile?.jobTitle || job.title || '未命名岗位'}</p>
              <p className="mt-1 truncate text-xs text-gray-500">{job.company || '未填写公司'} · {job.latestProfile ? `V${job.latestProfile.version}` : '待分析'}</p>
              {job.latestProfile?.status === 'confirmed' && <span className="mt-2 inline-flex items-center gap-1 text-xs text-green-600"><Check size={12} />已确认</span>}
            </button>
          ))}
          {jobs.length === 0 && <p className="py-10 text-center text-sm text-gray-400">还没有目标岗位</p>}
        </div>
      </aside>

      <section className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white p-6">
        {showCreate ? (
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xl font-bold">添加目标岗位</h2>
            <p className="mt-1 text-sm text-gray-500">粘贴完整 JD，系统会提取要求并保留原文证据。</p>
            {createProgress !== 'idle' && (
              <div className={`mt-5 rounded-xl border p-4 ${createProgress === 'error' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${savedJobId ? 'bg-green-100 text-green-600' : createProgress === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {savedJobId ? <Check size={17} /> : createProgress === 'error' ? <X size={17} /> : <Loader2 size={17} className="animate-spin" />}
                    </div>
                    <div><p className="text-sm font-medium text-gray-800">1. 保存 JD</p><p className="text-xs text-gray-500">{savedJobId ? '已保存' : createProgress === 'error' ? '保存失败' : '正在保存原文...'}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${createProgress === 'error' ? 'bg-red-100 text-red-600' : createProgress === 'analyzing' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      {createProgress === 'analyzing' ? <Loader2 size={17} className="animate-spin" /> : createProgress === 'error' ? <X size={17} /> : <span className="text-sm">2</span>}
                    </div>
                    <div><p className="text-sm font-medium text-gray-800">2. 生成岗位画像</p><p className="text-xs text-gray-500">{createProgress === 'analyzing' ? 'AI 正在分析职责和能力要求...' : createProgress === 'error' ? '分析未完成，可以重试' : '等待保存完成'}</p></div>
                  </div>
                </div>
                {createError && <p className="mt-3 border-t border-red-200 pt-3 text-sm text-red-700">{createError}</p>}
              </div>
            )}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <input disabled={busy || Boolean(savedJobId)} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="岗位名称（可选）" className="rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50" />
              <input disabled={busy || Boolean(savedJobId)} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="公司名称（可选）" className="rounded-lg border border-gray-200 px-3 py-2 disabled:bg-gray-50" />
            </div>
            <textarea disabled={busy || Boolean(savedJobId)} value={rawText} onChange={(e) => setRawText(e.target.value)} placeholder="在这里粘贴 JD 原文..." className="mt-4 min-h-[420px] w-full resize-y rounded-lg border border-gray-200 p-4 leading-7 disabled:bg-gray-50" />
            <div className="mt-4 flex justify-end gap-3">
              <button disabled={busy} onClick={closeCreate} className="rounded-lg border px-4 py-2 disabled:opacity-50">{savedJobId ? '查看已保存 JD' : '取消'}</button>
              <button disabled={busy} onClick={createAndAnalyze} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{busy && <Loader2 size={16} className="animate-spin" />}{savedJobId ? '重新分析' : '保存并分析'}</button>
            </div>
          </div>
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

                {analysisView === 'match' ? (
                  !matchResult ? <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center"><BarChart3 size={30} className="text-gray-300" /><p className="mt-3 font-medium text-gray-700">尚未运行岗位匹配</p><p className="mt-1 text-sm text-gray-400">只使用当前已确认岗位画像与所选简历。</p></div> :
                  <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-5"><aside className="rounded-xl border border-gray-200 bg-white p-5"><div className="text-center"><span className="text-4xl font-bold text-violet-600">{matchResult.score}</span><span className="text-gray-400"> / 100</span><p className="mt-2 font-semibold">岗位匹配分</p><p className="mt-1 text-xs text-gray-400">岗位画像 V{matchResult.jobProfileVersion}</p></div><div className="mt-5 space-y-3">{matchResult.dimensions.map((d) => <div key={d.key}><div className="flex justify-between text-xs text-gray-500"><span>{d.key}</span><span>{d.score}/{d.maxScore}</span></div><div className="mt-1 h-1.5 rounded bg-gray-100"><div className="h-full rounded bg-violet-500" style={{width:`${d.score/d.maxScore*100}%`}} /></div><p className="mt-1 text-xs text-gray-400">{d.reason}</p></div>)}</div><p className="mt-4 border-t pt-3 text-xs text-gray-400">{matchResult.modelName} · {matchResult.promptVersion}<br />整体置信度 {Math.round(matchResult.overallConfidence*100)}%</p></aside><section className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex justify-between"><div><h3 className="font-semibold">岗位要求逐项匹配</h3><p className="mt-1 text-sm text-gray-500">结论与 ATS、内容质量分开。</p></div>{matchResult.stale && <span className="h-fit rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">报告已过期</span>}</div><div className="mt-4 max-h-[520px] space-y-3 overflow-auto">{matchResult.requirements.map((item) => <article key={item.requirementId} className="rounded-lg border p-4"><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-gray-800">{item.requirementName}</span><span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{item.category==='responsibility'?'岗位职责':item.category==='required_skill'?'必备能力':'加分项'}</span><span className={`rounded px-2 py-0.5 text-xs ${item.status==='matched'?'bg-green-50 text-green-700':item.status==='gap'?'bg-red-50 text-red-700':'bg-amber-50 text-amber-700'}`}>{item.status==='matched'?'已匹配':item.status==='insufficient_evidence'?'证据不足':item.status==='gap'?'能力缺口':'待确认'}</span><span className="text-xs text-gray-400">置信度 {Math.round(item.confidence*100)}%</span></div><p className="mt-2 text-xs text-gray-400">JD 证据：{item.jdEvidence}</p>{item.resumeEvidence && <blockquote className="mt-3 border-l-2 pl-3 text-sm text-gray-600">{item.resumeEvidence}</blockquote>}<p className="mt-3 text-sm text-gray-700">{item.reason}</p>{item.section && <Link to={`/resumes/${matchResult.resumeId}/edit?section=${encodeURIComponent(item.section)}&itemId=${encodeURIComponent(item.itemId||'')}&field=${encodeURIComponent(item.field||'')}`} className="mt-3 inline-flex text-xs font-medium text-blue-600">查看简历证据</Link>}</article>)}</div></section></div>
                ) : analysisView === 'quality' ? (
                  !contentQuality ? (
                    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center">
                      <Sparkles size={30} className="text-gray-300" />
                      <p className="mt-3 font-medium text-gray-700">尚未运行内容质量评价</p>
                      <p className="mt-1 text-sm text-gray-400">使用你的默认模型检查连贯性、信息有效性、证据具体性、一致性与专业性。</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-5">
                      <aside className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="text-center"><span className="text-4xl font-bold text-blue-600">{contentQuality.score}</span><span className="text-gray-400"> / 100</span><p className="mt-2 font-semibold text-gray-800">内容质量分</p></div>
                        <div className="mt-5 space-y-3">
                          {contentQuality.dimensions.map((dimension) => (
                            <div key={dimension.key}><div className="flex justify-between text-xs text-gray-500"><span>{dimension.key}</span><span>{dimension.score}/{dimension.maxScore}</span></div><div className="mt-1 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-violet-500" style={{ width: `${dimension.score / dimension.maxScore * 100}%` }} /></div><p className="mt-1 text-xs leading-5 text-gray-400">{dimension.reason}</p></div>
                          ))}
                        </div>
                        <p className="mt-4 border-t pt-3 text-xs leading-5 text-gray-400">{contentQuality.modelName} · {contentQuality.promptVersion}<br />整体置信度 {Math.round(contentQuality.overallConfidence * 100)}%</p>
                      </aside>
                      <section className="rounded-xl border border-gray-200 bg-white p-5">
                        <div className="flex items-start justify-between"><div><h3 className="font-semibold text-gray-900">字段级语义问题</h3><p className="mt-1 text-sm text-gray-500">低于 70% 置信度的结论只标记为待确认。</p></div>{contentQuality.stale && <span className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">简历已修改，报告已过期</span>}</div>
                        <div className="mt-4 max-h-[520px] space-y-3 overflow-auto pr-1">
                          {contentQuality.issues.map((issue, index) => (
                            <article key={`${issue.fieldId}-${index}`} className="rounded-lg border border-gray-200 p-4">
                              <div className="flex items-center gap-2"><span className={`rounded px-2 py-0.5 text-xs ${issue.status === 'needs_confirmation' ? 'bg-amber-50 text-amber-700' : issue.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{issue.status === 'needs_confirmation' ? '待确认' : issue.severity === 'error' ? '严重' : issue.severity === 'warning' ? '警告' : '建议'}</span><span className="text-xs text-gray-400">置信度 {Math.round(issue.confidence * 100)}%</span></div>
                              <blockquote className="mt-3 border-l-2 border-gray-200 pl-3 text-sm text-gray-600">{issue.evidence}</blockquote>
                              <p className="mt-3 text-sm leading-6 text-gray-700">{issue.reason}</p><p className="mt-1 text-sm leading-6 text-blue-700">建议：{issue.suggestion}</p>
                              <Link to={`/resumes/${contentQuality.resumeId}/edit?section=${encodeURIComponent(issue.section)}&itemId=${encodeURIComponent(issue.itemId || '')}&field=${encodeURIComponent(issue.field)}`} className="mt-3 inline-flex text-xs font-medium text-blue-600">编辑对应字段</Link>
                            </article>
                          ))}
                          {contentQuality.issues.length === 0 && <div className="rounded-lg bg-green-50 p-8 text-center text-sm text-green-700">模型未发现明确的内容质量问题。</div>}
                        </div>
                      </section>
                    </div>
                  )
                ) : !atsResult ? (
                  <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center">
                    <FileText size={30} className="text-gray-300" />
                    <p className="mt-3 font-medium text-gray-700">选择简历后开始体检</p>
                    <p className="mt-1 text-sm text-gray-400">将检查完整性、内容证据密度、可解析性、日期与内容表达。</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      <p className="font-medium">本次结果的评价边界</p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-xs leading-5 text-blue-700">{atsResult.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  <div className="grid grid-cols-[220px_minmax(0,1fr)] gap-5">
                    <aside className="rounded-xl border border-gray-200 p-5 text-center">
                      <div className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[10px] ${atsResult.score >= 80 ? 'border-green-100 text-green-600' : atsResult.score >= 60 ? 'border-amber-100 text-amber-600' : 'border-red-100 text-red-600'}`}>
                        <span className="text-4xl font-bold">{atsResult.score}</span>
                      </div>
                      <p className="mt-3 font-semibold text-gray-800">ATS 结构分</p>
                      <p className="mt-1 text-xs text-gray-400">{atsResult.scorerVersion}</p>
                      <div className="mt-5 space-y-2 text-left">
                        {atsResult.dimensions.map((dimension) => (
                          <div key={dimension.key}>
                            <div className="flex justify-between text-xs text-gray-500"><span>{dimension.label}</span><span>{dimension.score}/{dimension.maxScore}</span></div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${dimension.maxScore ? dimension.score / dimension.maxScore * 100 : 0}%` }} /></div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                        <div><strong className="block text-base text-red-600">{atsResult.summary.errors}</strong>严重</div>
                        <div><strong className="block text-base text-amber-600">{atsResult.summary.warnings}</strong>警告</div>
                        <div><strong className="block text-base text-blue-600">{atsResult.summary.suggestions}</strong>建议</div>
                      </div>
                    </aside>
                    <section className="min-w-0 rounded-xl border border-gray-200 p-5">
                      <h3 className="font-semibold text-gray-900">可处理的问题</h3>
                      <p className="mt-1 text-sm text-gray-500">优先补齐严重问题；每项都显示完善后还能获得的分数。</p>
                      <div className="mt-4 max-h-[430px] space-y-3 overflow-auto pr-1">
                        {atsResult.issues.map((issue) => (
                          <div key={issue.id} className="rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 gap-3">
                                <AlertCircle size={18} className={issue.severity === 'error' ? 'mt-0.5 shrink-0 text-red-500' : issue.severity === 'warning' ? 'mt-0.5 shrink-0 text-amber-500' : 'mt-0.5 shrink-0 text-blue-500'} />
                                <div><p className="font-medium text-gray-800">{issue.title}</p><p className="mt-1 text-sm leading-6 text-gray-500">{issue.message}</p><p className="mt-2 text-xs text-gray-400">{issue.section} / {issue.itemId || '模块'} / {issue.field}</p></div>
                              </div>
                              <span className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${issue.availablePoints > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{issue.availablePoints > 0 ? `可得 +${issue.availablePoints}` : '必须修正'}</span>
                            </div>
                            <Link to={`/resumes/${atsResult.resumeId}/edit?section=${encodeURIComponent(issue.section)}&itemId=${encodeURIComponent(issue.itemId || '')}&field=${encodeURIComponent(issue.field)}`} className="mt-3 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700">编辑对应字段</Link>
                          </div>
                        ))}
                        {atsResult.issues.length === 0 && <div className="rounded-lg bg-green-50 p-8 text-center text-sm text-green-700">未发现 ATS 基础问题，下一步可以进行 JD 岗位匹配。</div>}
                      </div>
                    </section>
                  </div></div>
                )}
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
