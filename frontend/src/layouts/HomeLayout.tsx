import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth.api';
import { Avatar, Text } from '@mantine/core';
import { FileCheck2, FileText, LogOut, Target, UserRound, UserRoundSearch } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { logout } from '@/api/auth.api';
import { notification } from '@/components/common/Notification';
import ModelSelector from '@/components/common/ModelSelector';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function HomeLayout() {
  const { user, clearUser, isLoggedIn, isGuest, setUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkspaceRoute = /^\/resumes\/[^/]+\/edit$/.test(location.pathname)
    || location.pathname === '/interviews'
    || location.pathname.startsWith('/interviews/resume/');
  const isContainedRoute = location.pathname === '/jobs' || location.pathname.startsWith('/profile');
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const loginSucceeded = urlParams.get('login') === 'success';
    if (isGuest && !loginSucceeded) return;
    // 检查登录状态
    const checkAuth = async () => {
      try {
        const res = await getCurrentUser();
        if (res.code === 200 && res.data) {
          setUser(res.data);
          if (loginSucceeded) {
            notification.success(
              `欢迎回来，${res.data.github_login}！`,
              '登录成功'
            );
            window.history.replaceState({}, '', window.location.pathname);
          }
        } else if (res.code === 401 && !isGuest) {
          clearUser();
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        if (!isGuest) clearUser();
        if (loginSucceeded) {
          notification.error(
            'GitHub 授权已返回，但登录状态未能保存，请检查 Cookie 配置',
            '登录失败'
          );
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    checkAuth();
  }, [clearUser, isGuest, setUser]);

  const handleLogin = () => {
    navigate('/auth/login');
  };

  const handleLogout = async () => {
    try {
      const res = await logout();
      if (res.code === 200) {
        clearUser();
        localStorage.removeItem('token');
        notification.success('登出成功');
      }
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const navItems = [
    { label: '我的简历', path: '/resumes', icon: FileText, active: location.pathname.startsWith('/resumes') },
    { label: '目标岗位', path: '/jobs', icon: Target, active: location.pathname.startsWith('/jobs') },
    { label: '模拟面试', path: '/interviews', icon: UserRoundSearch, active: location.pathname === '/interviews' || location.pathname.startsWith('/interviews/resume/') },
    { label: '个人中心', path: '/profile', icon: UserRound, active: location.pathname.startsWith('/profile') || location.pathname.startsWith('/interviews/results/') },
  ];

  return (
    <div className={`flex flex-col bg-[#F4F7F6] text-[#17211D] ${isContainedRoute || isWorkspaceRoute ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#D8E1DD] bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <button onClick={() => navigate('/resumes')} className="flex shrink-0 items-center gap-3 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176B52] text-white">
            <FileCheck2 size={20} strokeWidth={1.9} />
          </div>
          <div className="hidden xl:block">
            <Text size="sm" fw={700} c="#17211D">AI 简历助手</Text>
            <Text size="xs" c="#7A8782">求职证据工作台</Text>
          </div>
        </button>

        <nav className="ml-5 flex h-full flex-1 items-center justify-center gap-1 lg:ml-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex h-full items-center gap-2 px-3 text-sm transition-colors lg:px-5 ${item.active ? 'font-semibold text-[#176B52]' : 'text-[#66736D] hover:text-[#17211D]'}`}
              >
                <Icon size={17} />
                <span className="hidden md:inline">{item.label}</span>
                {item.active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#176B52]" />}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden lg:block"><ModelSelector variant="full" readOnly /></div>
          <ThemeToggle />

          {/* 用户信息：登录后显示 */}
          {isLoggedIn && user && (
            <div className="flex items-center gap-2">
              <Avatar onClick={() => navigate('/profile')} title="个人中心"
                size="md"
                src={user.github_avatar || undefined}
                alt={user.github_login || 'User'}
                className="cursor-pointer border-2 border-[#D8E1DD] bg-[#176B52] text-white"
              >
                {user.github_login?.charAt(0) || 'U'}
              </Avatar>
              <Text size="sm" fw="medium" className="hidden xl:block">
                {user.github_login || '用户'}
              </Text>
            </div>
          )}

          {isGuest && (
            <span className="hidden rounded-lg border border-[#D8E1DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#66736D] sm:inline">
              展示模式
            </span>
          )}

          {/* 登录/登出按钮 */}
          <button
            onClick={isLoggedIn ? handleLogout : handleLogin}
            title={isLoggedIn ? '退出登录' : '登录'}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            {isLoggedIn ? <LogOut size={18} /> : '登录'}
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className={isWorkspaceRoute ? 'min-h-0 flex-1' : isContainedRoute ? 'min-h-0 flex-1 overflow-hidden py-5 lg:py-6' : 'flex-1 py-5 lg:py-6'}>
        <Outlet />
      </main>

      {/* 底部 Footer */}
      {!isWorkspaceRoute && !isContainedRoute && <footer className="flex items-center justify-between border-t border-[#D8E1DD] bg-white px-8 py-5 text-[#7A8782]">
        <Text size="xs">© 2026 AI 简历助手</Text>
        <Text size="xs">让每一次投递都有依据</Text>
      </footer>}
    </div>
  );
}
