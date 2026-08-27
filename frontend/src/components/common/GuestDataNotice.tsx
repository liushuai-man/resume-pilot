import { CloudOff, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import { guestWorkspace } from '@/services/guest-workspace';
import { useResumeStore } from '@/store/useResumeStore';
import { useDocumentStore } from '@/store/useDocumentStore';

export default function GuestDataNotice() {
  const isGuest = useUserStore((state) => state.isGuest);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  if (!isGuest) return null;

  const clearLocalData = async () => {
    if (!window.confirm('确定清空这台设备上的全部游客简历、岗位和面试记录吗？此操作无法恢复。')) return;
    await guestWorkspace.clear();
    useResumeStore.getState().reset();
    useDocumentStore.getState().reset();
    navigate('/resumes', { replace: true });
    window.location.reload();
  };

  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex items-center gap-1.5 rounded-lg border border-[#D8E1DD] bg-[#F7F9F8] px-2.5 py-1.5 text-xs font-semibold text-[#52615B] transition hover:border-[#9BB6AA] hover:text-[#176B52]">
      <CloudOff size={14} />游客 · 已存到本机
    </button>
    {open && <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-[#D8E1DD] bg-white p-4 text-left shadow-[0_18px_45px_rgba(23,33,29,0.14)]">
      <button type="button" onClick={() => setOpen(false)} aria-label="关闭" className="absolute right-3 top-3 text-[#7A8782]"><X size={15}/></button>
      <p className="pr-6 text-sm font-semibold text-[#17211D]">当前成果保存在这台设备</p>
      <p className="mt-2 text-xs leading-5 text-[#66736D]">清理浏览器数据、使用无痕窗口或更换设备后无法恢复。你可以继续体验全部工作台。</p>
      <button type="button" onClick={() => navigate('/auth/login', { state: { from: location.pathname } })} className="mt-3 w-full rounded-lg bg-[#176B52] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#10563F]">登录并同步当前成果</button>
      <button type="button" onClick={() => void clearLocalData()} className="mt-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-[#A33B32] transition hover:bg-[#FFF1EF]">清空这台设备上的游客数据</button>
    </div>}
  </div>;
}
