import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Check, Loader2, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { jobApi } from '@/api/job.api';
import { notification } from '@/components/common/Notification';
import { getApiErrorMessage } from '@/utils/api-error';
import type {
  EditableJobProfile,
  JobDescription,
  JobProfile,
  JobRequirement,
} from '@/types/job';

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

  const selected = useMemo(
    () => jobs.find((job) => job.id === selectedId) || null,
    [jobs, selectedId]
  );

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
  }, []);

  const selectJob = async (job: JobDescription) => {
    if (busy) return;
    setSelectedId(job.id);
    setProfileVersions([]);
    showProfile(job.latestProfile || null);
    setShowCreate(false);
    setWorkspaceTab('profile');
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

  if (loading) {
    return <div className="flex min-h-[480px] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  const confirmed = profile?.status === 'confirmed';
  const editable = profile?.status === 'draft';
  const profileStatusLabel = profile?.status === 'confirmed'
    ? '当前确认'
    : profile?.status === 'superseded'
      ? '历史版本'
      : '待确认';

  return (
    <div className="mx-auto max-w-[1500px] px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">TARGET JOBS</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">目标岗位</h1>
          <p className="mt-2 text-gray-500">以确认后的岗位画像统一驱动简历匹配、优化和模拟面试。</p>
        </div>
        <button disabled={busy} onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17} />添加 JD</button>
      </div>
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
              <div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><BarChart3 size={24} /></div>
                <h2 className="mt-4 text-lg font-semibold text-gray-900">ATS 与岗位匹配</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">这里将选择一份简历，并分别展示 ATS 基础分、JD 匹配度和可定位的问题。当前先完成岗位画像确认，评分能力将在阶段 2 接入。</p>
                {!confirmed && <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">请先确认当前岗位画像，后续评分才有稳定依据。</p>}
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
