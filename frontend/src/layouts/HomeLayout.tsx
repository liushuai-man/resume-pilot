import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth.api';
import { Avatar, Text } from '@mantine/core';
import { FileText, History, LogOut, Target, UserRoundSearch } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { logout } from '@/api/auth.api';
import { notification } from '@/components/common/Notification';
import ModelSelector from '@/components/common/ModelSelector';

export default function HomeLayout() {
  const { user, clearUser, isLoggedIn, setUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    // 检查登录状态
    const checkAuth = async () => {
      try {
        const res = await getCurrentUser();
        if (res.code === 200 && res.data) {
          setUser(res.data);
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('login') === 'success') {
            notification.success(
              `欢迎回来，${res.data.github_login}！`,
              '登录成功'
            );
            window.history.replaceState({}, '', window.location.pathname);
          }
        } else if (res.code === 401) {
          clearUser();
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        clearUser();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('login') === 'success') {
          notification.error(
            'GitHub 授权已返回，但登录状态未能保存，请检查 Cookie 配置',
            '登录失败'
          );
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };

    checkAuth();
  }, []);

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
    { label: '我的简历', path: '/', icon: FileText, active: location.pathname === '/' },
    { label: '目标岗位', path: '/jobs', icon: Target, active: location.pathname.startsWith('/jobs') },
    { label: '模拟面试', path: '/interviews', icon: UserRoundSearch, active: location.pathname.startsWith('/interviews') },
    { label: '历史记录', path: '/history', icon: History, active: location.pathname.startsWith('/history') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-gray-200 bg-white px-5 lg:px-8">
        <button onClick={() => navigate('/')} className="flex shrink-0 items-center gap-3 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
            <Text fw="bold" c="white" size="sm">RP</Text>
          </div>
          <div className="hidden xl:block">
            <Text size="md" fw="bold">ResumePilot</Text>
            <Text size="xs" c="dimmed">AI 求职助手</Text>
          </div>
        </button>

        <nav className="ml-5 flex h-full flex-1 items-center justify-center gap-1 lg:ml-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex h-full items-center gap-2 px-3 text-sm transition-colors lg:px-5 ${item.active ? 'font-medium text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <Icon size={17} />
                <span className="hidden md:inline">{item.label}</span>
                {item.active && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600" />}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden lg:block"><ModelSelector variant="full" /></div>

          {/* 用户信息：登录后显示 */}
          {isLoggedIn && user && (
            <div className="flex items-center gap-2">
              <Avatar
                size="md"
                src={user.github_avatar || undefined}
                alt={user.github_login || 'User'}
                className="bg-blue-500 border-gray-200 border-2 rounded-full text-white"
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
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            {isLoggedIn ? <LogOut size={18} /> : '登录'}
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 py-8">
        <Outlet />
      </main>

      {/* 底部 Footer */}
      <footer className="flex items-center justify-between border-t border-gray-200 bg-white px-8 py-5 text-gray-400">
        <Text size="xs">© 2026 ResumePilot</Text>
        <Text size="xs">让每一次投递都有依据</Text>
      </footer>
    </div>
  );
}
