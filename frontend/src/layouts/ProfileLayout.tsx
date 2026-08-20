import { Outlet, useNavigate } from 'react-router-dom';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { useUserStore } from '@/store/useUserStore';
import { UserRound } from 'lucide-react';

export default function ProfileLayout() {
  const isGuest = useUserStore((state) => state.isGuest);
  const navigate = useNavigate();
  if (isGuest) {
    return (
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-center px-6">
        <div className="w-full max-w-[520px] rounded-[8px] border border-[#D8E1DD] bg-white p-6 text-center shadow-sm">
          <UserRound className="mx-auto text-[#176B52]" size={24} />
          <h1 className="mt-4 text-lg font-semibold text-[#17211D]">个人中心需要登录后查看</h1>
          <p className="mt-2 text-sm leading-6 text-[#66736D]">
            展示模式不会读取个人数据。登录后可以查看简历、岗位、面试报告和模型配置记录。
          </p>
          <button
            type="button"
            onClick={() => navigate('/auth/login', { state: { from: '/profile' } })}
            className="mt-5 h-10 rounded-lg bg-[#176B52] px-4 text-sm font-semibold text-white transition hover:bg-[#10563F]"
          >
            登录后查看
          </button>
        </div>
      </div>
    );
  }
  return <div className="mx-auto flex h-full w-full max-w-[1440px] items-stretch gap-8 px-6"><ProfileSidebar/><div className="min-w-0 flex-1 overflow-y-auto pr-1"><Outlet/></div></div>;
}
