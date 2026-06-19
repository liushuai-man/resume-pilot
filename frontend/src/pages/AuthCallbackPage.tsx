import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '@/components/common/LoadingPage';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 后端已经处理完 OAuth 回调并设置了 cookie
    // 直接跳转到首页，由 HomeLayout 获取用户信息
    navigate('/?login=success');
  }, [navigate]);

  return <LoadingPage title="登录中..." />;
}
