import type { ChangeEvent, RefObject } from 'react';
import { Progress } from '@mantine/core';
import { BriefcaseBusiness, FileText, ImageIcon, Paperclip, Square } from 'lucide-react';
import type { JobProfile } from '@/types/job';
import CompactDropdown from '@/components/common/CompactDropdown';

interface Props {
  resumes: any[]; selectedResumeId: string | null;
  jobProfiles: Array<JobProfile & { company?: string | null }>; selectedJobProfileId: string | null;
  questionCount: string; questionCountMode: 'fixed' | 'adaptive'; minQuestions: number; maxQuestions: number;
  sessionId: string | null; answerCount: number;
  finishing: boolean; uploading: boolean; fileInputRef: RefObject<HTMLInputElement>;
  onSelectResume: (id: string) => void; onSelectJobProfile: (id: string | null) => void;
  onQuestionCountChange: (value: string) => void; onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onFinish: () => void;
}

export default function InterviewToolbar(props: Props) {
  const active = Boolean(props.sessionId);
  const resumeOptions = props.resumes.map((item) => ({ value: item.id, label: item.title, description: item.content?.isUploadedFile ? '导入的简历' : '我的简历', icon: item.content?.isUploadedFile ? <ImageIcon size={14}/> : <FileText size={14}/> }));
  const jobOptions = [{ value: 'general', label: '通用岗位', description: '使用系统评价标准', icon: <BriefcaseBusiness size={14}/> }, ...props.jobProfiles.map((profile) => ({ value: profile.id, label: profile.jobTitle, description: profile.company || `画像 V${profile.version}`, icon: <BriefcaseBusiness size={14}/> }))];
  return <div className="mt-2 flex min-h-9 items-end gap-2 border-t border-[#E5EBE8] pt-2 pr-11">
    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-visible">
      <input type="file" ref={props.fileInputRef} onChange={props.onFileUpload} accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" className="hidden"/>
      <button type="button" title="导入简历" onClick={() => props.fileInputRef.current?.click()} disabled={active || props.uploading} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#65736D] transition hover:bg-[#EEF3F1] disabled:opacity-40"><Paperclip size={16}/></button>
      <CompactDropdown ariaLabel="选择简历" value={props.selectedResumeId || ''} options={resumeOptions} onChange={props.onSelectResume} disabled={active} className="max-w-44" />
      <CompactDropdown ariaLabel="选择目标岗位" value={props.selectedJobProfileId || 'general'} options={jobOptions} onChange={(value) => props.onSelectJobProfile(value === 'general' ? null : value)} disabled={active} className="max-w-44" />
    </div>
    <div className="flex shrink-0 items-center gap-2">{active ? <><div className="w-24"><div className="mb-0.5 flex justify-between text-[9px] text-[#7A8782]"><span>进度</span><span>{props.answerCount}/{props.questionCountMode === 'adaptive' ? `${props.minQuestions}–${props.maxQuestions}` : props.maxQuestions}</span></div><Progress color="#176B52" value={(props.answerCount / props.maxQuestions) * 100} size={3}/></div><button type="button" onClick={props.onFinish} disabled={props.finishing} className="flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs text-[#B54747] hover:bg-red-50"><Square size={13}/>结束</button></> : <label className="flex h-8 items-center gap-1.5 rounded-lg border border-[#DCE4E0] bg-white px-2 text-xs text-[#65736D]" title="留空时由 Agent 在 5–10 题之间决定结束时机"><span>题数</span><input aria-label="面试题数" type="number" min={3} max={10} step={1} value={props.questionCount} placeholder="Agent" onChange={(event) => props.onQuestionCountChange(event.target.value)} className="w-14 bg-transparent text-center font-medium text-[#17211D] outline-none placeholder:text-[#8B9892]"/></label>}
    </div>
  </div>;
}
