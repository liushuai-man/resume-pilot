import { BriefcaseBusiness, FileText, ListChecks, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export type InterviewWorkspacePanel = 'resume' | 'job' | 'transcript';

interface Props {
  activePanel: InterviewWorkspacePanel;
  collapsed: boolean;
  onSelect: (panel: InterviewWorkspacePanel) => void;
  onToggleCollapsed: () => void;
}

const panels = [
  { key: 'resume' as const, label: '简历', icon: FileText },
  { key: 'job' as const, label: '岗位', icon: BriefcaseBusiness },
  { key: 'transcript' as const, label: '记录', icon: ListChecks },
];

export default function InterviewWorkspaceRail({ activePanel, collapsed, onSelect, onToggleCollapsed }: Props) {
  return (
    <nav aria-label="面试辅助面板" className="flex w-[72px] flex-shrink-0 flex-col items-center gap-2 border-r border-[#D8E1DD] bg-[#EAF0ED] py-4">
      {panels.map(({ key, label, icon: Icon }) => (
        <button key={key} type="button" aria-pressed={!collapsed && activePanel === key}
          onClick={() => { if (collapsed || activePanel !== key) onSelect(key); }}
          className={`flex w-14 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/40 ${!collapsed && activePanel === key ? 'bg-white text-[#176B52] shadow-sm' : 'text-[#52635C] hover:bg-white/60 hover:text-[#17211D]'}`}>
          <Icon size={17} /><span>{label}</span>
        </button>
      ))}
      <div className="mt-auto">
        <button type="button" onClick={onToggleCollapsed} title={collapsed ? '展开辅助面板' : '收起辅助面板'}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#52635C] transition hover:bg-white/60 hover:text-[#17211D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176B52]/40">
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>
    </nav>
  );
}
