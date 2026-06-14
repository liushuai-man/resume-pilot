import { Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import HomePage from '@/pages/HomePage';
import MainLayout from '@/layouts/MainLayout';
import HomeLayout from '@/layouts/HomeLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ResumeEditorPage from '@/pages/ResumeEditorPage';
import InterviewPage from '@/pages/InterviewPage';
import NotFoundPage from '@/components/common/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* 认证相关页面 */}
      <Route element={<AuthLayout />}>
        <Route path="/auth/login" element={<LoginPage />} />
      </Route>

      {/* 首页布局 */}
      <Route element={<HomeLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* 主要功能布局 */}
      <Route element={<MainLayout />}>
        <Route path="/resume/:id" element={<ResumeEditorPage />} />
        <Route path="/resume/interview" element={<InterviewPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
