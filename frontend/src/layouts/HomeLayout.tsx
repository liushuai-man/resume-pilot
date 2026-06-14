import { useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth.api';
import { Avatar, Text } from '@mantine/core';
import { Mail } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { logout } from '@/api/auth.api';
import { notification } from '@/components/common/Notification';

export default function HomeLayout() {
  const { user, clearUser, isLoggedIn, setUser } = useUserStore();
  const navigate = useNavigate();
  const hasShownWelcome = useRef(false);
  useEffect(() => {
    // 检查登录状态
    const checkAuth = async () => {
      try {
        const res = await getCurrentUser();
        if (res.code === 200 && res.data) {
          setUser(res.data);
          // 登录成功后显示欢迎通知（只显示一次）
          if (!hasShownWelcome.current) {
            hasShownWelcome.current = true;
            notification.success(
              `欢迎回来，${res.data.github_login}！`,
              '登录成功'
            );
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
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
        notification.success('登出成功');
      }
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Text  fw="bold">
              RA
            </Text>
          </div>
          <Text size="lg" fw="bold">
            ResumePilot
          </Text>
        </div>

        <div className="flex items-center gap-6">
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
              <Text size="sm" fw="medium">
                {user.github_login || '用户'}
              </Text>
            </div>
          )}

          {/* 登录/登出按钮 */}
          <button
            onClick={isLoggedIn ? handleLogout : handleLogin}
            className="text-md text-gray-600 bg-transparent border-none cursor-pointer 
                       hover:text-blue-500 hover:underline transition-colors duration-200"
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 px-6 py-6 bg-gray-50 rounded-lg">
        <Outlet />
      </main>

      {/* 底部 Footer */}
      <footer className="text-gray-500  border-t border-gray-200 bg-gray-300  px-6 py-5 flex items-center justify-between">
        <Text size="sm">© 2026 ResumePilot. All rights reserved.</Text>
        <div className="flex items-center gap-2 text-sm">
          <a
            href="#"
            className="flex items-center gap-1 hover:text-blue-500 hover:underline"
          >
            <Mail size={14} />
            联系开发者
          </a>
        </div>
      </footer>
    </div>
  );
}
