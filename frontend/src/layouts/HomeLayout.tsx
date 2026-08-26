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
import GuestDataNotice from '@/components/common/GuestDataNotice';
import { useResumeStore } from '@/store/useResumeStore';
import { useDocumentStore } from '@/store/useDocumentStore';

export default function HomeLayout() {
  const { user, clearUser, enterGuestMode, isLoggedIn, isGuest, setUser } = useUserStore();
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
      if (res.code !== 200) throw new Error(res.message || '退出登录失败');
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      useResumeStore.getState().reset();
      useDocumentStore.getState().reset();
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      enterGuestMode();
      navigate('/resumes', { replace: true });
      notification.success('已退出登录，当前为游客模式');
    }
  };

  const navItems = [
    { label: '我的简历', path: '/resumes', icon: FileText, active: location.pathname.startsWith('/resumes') },
    { label: '目标岗位', path: '/jobs', icon: Target, active: location.pathname.startsWith('/jobs') },
    { label: '模拟面试', path: '/interviews', icon: UserRoundSearch, active: location.pathname === '/interviews' || location.pathname.startsWith('/interviews/resume/') },
    { label: '个人中心', path: '/profile', icon: UserRound, active: location.pathname.startsWith('/profile') || location.pathname.startsWith('/interviews/results/') },
  ];

  return (
    <div className={`flex flex-col bg-canvas text-ink ${isContainedRoute || isWorkspaceRoute ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-surface/95 px-4 text-ink backdrop-blur sm:px-6 lg:px-8">
        <button onClick={() => navigate('/resumes')} className="flex shrink-0 items-center gap-3 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-contrast">
            <FileCheck2 size={20} strokeWidth={1.9} />
          </div>
          <div className="hidden xl:block">
            <Text size="sm" fw={700} className="text-ink">AI 简历助手</Text>
            <Text size="xs" className="text-subtle">求职证据工作台</Text>
          </div>
        </button>

        <nav className="ml-5 flex h-full flex-1 items-center justify-center gap-1 lg:ml-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex h-full items-center gap-2 px-3 text-sm transition-colors lg:px-5 ${item.active ? 'font-semibold text-brand' : 'text-muted hover:text-ink'}`}
              >
                <Icon size={17} />
                <span className="hidden md:inline">{item.label}</span>
                {item.active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand" />}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden lg:block"><ModelSelector variant="full" readOnly /></div>
          <ThemeToggle />
          <GuestDataNotice />

          {/* 用户信息：登录后显示 */}
          {isLoggedIn && user && (
            <div className="flex items-center gap-2">
              <Avatar onClick={() => navigate('/profile')} title="个人中心"
                size="md"
                src={user.github_avatar || undefined}
                alt={user.github_login || 'User'}
                className="cursor-pointer border-2 border-border bg-brand text-brand-contrast"
              >
                {user.github_login?.charAt(0) || 'U'}
              </Avatar>
              <Text size="sm" fw="medium" className="hidden xl:block">
                {user.github_login || '用户'}
              </Text>
            </div>
          )}

          {/* 登录/登出按钮 */}
          <button
            onClick={isLoggedIn ? handleLogout : handleLogin}
            title={isLoggedIn ? '退出登录' : '登录'}
            className="rounded-lg p-2 text-subtle transition hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
      {!isWorkspaceRoute && !isContainedRoute && <footer className="flex items-center justify-between border-t border-border bg-surface px-8 py-5 text-subtle">
        <Text size="xs">© 2026 AI 简历助手</Text>
        <Text size="xs">让每一次投递都有依据</Text>
      </footer>}
    </div>
  );
}
