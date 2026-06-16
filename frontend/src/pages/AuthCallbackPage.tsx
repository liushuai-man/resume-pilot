import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { githubLogin } from '@/api/auth.api';
import { notification } from '@/components/common/Notification';
import LoadingPage from '@/components/common/LoadingPage';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    async function handleLogin() {
      if (!code) return;
      try {
        const res = await githubLogin({ code });
        if (res.code === 200) {
          notification.success('登录成功');
          navigate('/');
        } else {
          notification.error('登录失败');
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('登录失败:', error);
      }
    }
    handleLogin();
  }, []);

  return <LoadingPage title="登录中..." />;
}
