import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';


export default function HomePage() {
  const { user, isLoggedIn } = useUserStore();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        欢迎使用 AI Resume Agent
      </h1>
      {isLoggedIn && user ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">您已登录，可以开始使用啦！</p>
          <p className="text-gray-500">欢迎回来，{user.github_login}！</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录以开始使用</p>
          <Button onClick={() => navigate('/auth/login')} color="blue">
            去登录
          </Button>
        </div>
      )}
    </div>
  );
}
