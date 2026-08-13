import { Avatar } from '@mantine/core';
import { BrainCircuit, Cpu, GitBranch, History, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { formatDateTime } from '@/utils/format';

interface Props { joinedAt?: string; }

export default function ProfileSidebar({ joinedAt }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserStore();
  const items = [
    { label: '个人概览', path: '/profile', icon: LayoutDashboard, active: location.pathname === '/profile' },
    { label: '能力画像', path: '/profile/insights', icon: BrainCircuit, active: location.pathname.startsWith('/profile/insights') },
    { label: '面试记录', path: '/profile/interviews', icon: History, active: location.pathname.startsWith('/profile/interviews') || location.pathname.startsWith('/interviews/results/') },
    { label: '面试模型', path: '/profile/models', icon: Cpu, active: location.pathname.startsWith('/profile/models') },
  ];
  return <aside className="flex w-60 shrink-0 flex-col self-stretch rounded-xl border border-[#D8E1DD] bg-white p-4">
    <div className="border-b border-[#E4EAE7] px-2 pb-4"><div className="flex items-center gap-3"><Avatar size={44} src={user?.github_avatar || undefined} className="shrink-0 bg-[#176B52] text-white">{user?.github_login?.charAt(0) || 'U'}</Avatar><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#17211D]">{user?.github_login || '用户'}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-[#7A8782]"><GitBranch size={12}/>GitHub 账号</p></div></div><div className="mt-3 space-y-1.5 text-[11px] text-[#7A8782]"><p className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-[#176B52]"/>账号已连接</p>{joinedAt && <p>加入于 {formatDateTime(joinedAt)}</p>}</div></div>
    <nav className="mt-3 space-y-1" aria-label="个人中心导航">{items.map(({ label, path, icon: Icon, active }) => <button key={path} onClick={() => navigate(path)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-[#E4F0EB] text-[#176B52]' : 'text-[#66736D] hover:bg-[#F4F7F6] hover:text-[#17211D]'}`}><Icon size={17}/>{label}</button>)}</nav>
  </aside>;
}
