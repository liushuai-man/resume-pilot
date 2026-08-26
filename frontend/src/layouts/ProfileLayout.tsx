import { Outlet } from 'react-router-dom';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

export default function ProfileLayout() {
  return <div className="mx-auto flex h-full w-full max-w-[1440px] items-stretch gap-8 px-6"><ProfileSidebar/><div className="min-w-0 flex-1 overflow-y-auto pr-1"><Outlet/></div></div>;
}
