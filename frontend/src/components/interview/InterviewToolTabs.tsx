import { BriefcaseBusiness, FileText, ListChecks, NotebookPen, PanelRightClose } from 'lucide-react';
import type { InterviewWorkspacePanel } from './InterviewWorkspaceRail';

const tools = [
  { key: 'resume' as const, label: '简历', icon: FileText },
  { key: 'job' as const, label: '岗位', icon: BriefcaseBusiness },
  { key: 'transcript' as const, label: '记录', icon: ListChecks },
  { key: 'notes' as const, label: '笔记', icon: NotebookPen },
];

interface Props { activePanel: InterviewWorkspacePanel; onSelect: (panel: InterviewWorkspacePanel) => void; onCollapse: () => void; }

export default function InterviewToolTabs({ activePanel, onSelect, onCollapse }: Props) {
  return <div className="flex h-12 items-center border-b border-[#E1E7E4] bg-[#F7F9F8] px-2">
    <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">{tools.map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => onSelect(key)} className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs transition ${activePanel === key ? 'bg-white font-medium text-[#24312C] shadow-sm ring-1 ring-[#DCE4E0]' : 'text-[#718079] hover:bg-white/70'}`}><Icon size={14}/>{label}</button>)}</div>
    <button type="button" onClick={onCollapse} title="收起侧边栏" className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#66736D] hover:bg-white"><PanelRightClose size={16}/></button>
  </div>;
}
