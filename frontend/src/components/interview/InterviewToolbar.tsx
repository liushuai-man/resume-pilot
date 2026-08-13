import type { ChangeEvent, RefObject } from 'react';
import { Button, Progress, Select, Text } from '@mantine/core';
import { FileText, History, ImageIcon, Play, Square, Trash2, Upload } from 'lucide-react';
import type { JobProfile } from '@/types/job';

interface Props {
  resumes: any[]; selectedResumeId: string | null; showResumeDropdown: boolean;
  jobProfiles: Array<JobProfile & { company?: string | null }>; selectedJobProfileId: string | null;
  questionCount: string; sessionId: string | null; answerCount: number;
  starting: boolean; finishing: boolean; uploading: boolean; fileInputRef: RefObject<HTMLInputElement>;
  onToggleResumeDropdown: () => void; onSelectResume: (id: string) => void; onDeleteResume: (id: string) => void;
  onSelectJobProfile: (id: string | null) => void; onQuestionCountChange: (value: string) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void; onOpenHistory: () => void; onStart: () => void; onFinish: () => void;
}

export default function InterviewToolbar(props: Props) {
  const active = Boolean(props.sessionId);
  return <header className="border-b border-gray-200 bg-white px-4 py-2"><div className="flex items-center justify-between gap-4">
    <Text size="lg" fw={600} className="whitespace-nowrap text-[#17211D]">模拟面试工作台</Text>
    <div className="flex flex-1 items-center justify-center gap-3">
      <div className="resume-dropdown-container relative"><button onClick={props.onToggleResumeDropdown} disabled={active} className={`flex h-7 w-56 items-center justify-between rounded-md border px-3 text-xs ${active ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400' : 'border-gray-300 bg-white text-gray-700'}`}><span className="truncate">{props.resumes.find((item) => item.id === props.selectedResumeId)?.title || '选择简历'}</span><span>⌄</span></button>
        {props.showResumeDropdown && <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">{props.resumes.map((item) => <div key={item.id} onClick={() => props.onSelectResume(item.id)} className={`flex cursor-pointer items-center justify-between px-3 py-2 ${item.id === props.selectedResumeId ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}><div className="flex min-w-0 items-center gap-2">{item.content?.fileType === 'pdf' ? <FileText size={13}/> : item.content?.isUploadedFile ? <ImageIcon size={13}/> : <FileText size={13}/>}<span className="truncate text-xs">{item.title}</span></div>{item.content?.isUploadedFile && !active && <button onClick={(event) => { event.stopPropagation(); props.onDeleteResume(item.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14}/></button>}</div>)}</div>}
      </div>
      <Select data={[{ label: '通用岗位（系统 Rubric）', value: 'general' }, ...props.jobProfiles.map((profile) => ({ label: `${profile.jobTitle}${profile.company ? ` · ${profile.company}` : ''}（v${profile.version}）`, value: profile.id }))]} value={props.selectedJobProfileId || 'general'} onChange={(value) => props.onSelectJobProfile(value === 'general' ? null : value)} size="xs" className="w-64" disabled={active}/>
      <Select data={['3','5','8','10'].map((value) => ({ label: `${value}题`, value }))} value={props.questionCount} onChange={(value) => props.onQuestionCountChange(value || '5')} size="xs" className="w-24" disabled={active}/>
    </div>
    <div className="flex items-center gap-3">{active && <div className="w-32"><div className="mb-1 flex justify-between text-xs text-gray-500"><span>进度</span><span>{props.answerCount}/{props.questionCount}</span></div><Progress value={(props.answerCount / Number(props.questionCount)) * 100} size="xs"/></div>}
      <input type="file" ref={props.fileInputRef} onChange={props.onFileUpload} accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" className="hidden"/><Button variant="outline" size="xs" leftSection={<Upload size={14}/>} onClick={() => props.fileInputRef.current?.click()} loading={props.uploading} disabled={active}>导入简历</Button>
      {!active ? <><Button variant="subtle" size="xs" leftSection={<History size={14}/>} onClick={props.onOpenHistory}>面试记录</Button><Button size="xs" leftSection={<Play size={14}/>} onClick={props.onStart} loading={props.starting} disabled={!props.selectedResumeId}>开始面试</Button></> : <Button variant="outline" size="xs" color="red" leftSection={<Square size={14}/>} onClick={props.onFinish} loading={props.finishing}>结束面试</Button>}
    </div>
  </div></header>;
}
