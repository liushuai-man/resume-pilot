import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { ArrowLeft, CloudOff, FileCheck2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { notification } from '@/components/common/Notification';
import { useUserStore } from '@/store/useUserStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const enterGuestMode = useUserStore((state) => state.enterGuestMode);
  const from = (location.state as { from?: string } | null)?.from || '/resumes';

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorCode = urlParams.get('error');
    if (!errorCode) return;

    const messages: Record<string, string> = {
      auth_failed: 'GitHub 登录失败，请稍后重试',
      missing_code: 'GitHub 未返回授权码，请重新登录',
      access_denied: '你取消了 GitHub 授权',
    };

    notification.error(messages[errorCode] ?? 'GitHub 登录失败，请重新尝试', '登录失败');
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const handleLoginToGithub = () => {
    try {
      window.location.href = `/api/auth/github?returnTo=${encodeURIComponent(from)}`;
    } catch (error) {
      console.error('跳转github登录失败:', error);
      navigate('/auth/login');
    }
  };

  const handleSkipLogin = () => {
    enterGuestMode();
    notification.info('游客草稿仅保存在当前浏览器，请留意页面中的数据提醒');
    navigate(from, { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F7F6] px-6 text-[#17211D]">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute left-6 top-6 flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#66736D] transition hover:bg-white hover:text-[#17211D]"
      >
        <ArrowLeft size={16} />
        返回展示页
      </button>

      <section className="w-full max-w-[360px] rounded-[8px] border border-[#D8E1DD] bg-white p-5 text-center shadow-sm">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-[#176B52] text-white">
          <FileCheck2 size={20} strokeWidth={1.9} />
        </span>
        <h1 className="mt-4 text-lg font-semibold">进入工作台</h1>
        <p className="mt-1 text-xs leading-5 text-[#66736D]">登录可云端保存；也可以先以游客身份完整编辑</p>

        <div className="mt-5">
          <Button
            size="md"
            fullWidth
            color="dark"
            radius={8}
            h={44}
            leftSection={<FaGithub size={18} />}
            onClick={handleLoginToGithub}
          >
            使用 GitHub 登录
          </Button>

          <button
            type="button"
            onClick={handleSkipLogin}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#C5D1CC] bg-[#F4F7F6] text-sm font-semibold text-[#176B52] transition hover:border-[#176B52] hover:bg-white"
          >
            <CloudOff size={16} />
            不登录，先以游客身份使用
          </button>
          <p className="mt-3 text-left text-[11px] leading-5 text-[#806138]">游客可创建、编辑和预览简历，草稿只留在当前浏览器；清理数据或更换设备后无法恢复。AI、岗位、面试和云端历史需要登录。</p>
        </div>
      </section>
    </main>
  );
}
