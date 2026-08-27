import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// 路由配置类型
export interface RouteConfig {
  path: string;
  element?: React.ReactNode;
  layout?: React.ReactNode;
  children?: RouteConfig[];
}

// 布局组件（延迟加载）
const AuthLayout = React.lazy(() => import('@/layouts/AuthLayout'));
const HomeLayout = React.lazy(() => import('@/layouts/HomeLayout'));
const ProfileLayout = React.lazy(() => import('@/layouts/ProfileLayout'));

// 页面组件（延迟加载）
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const LandingPage = React.lazy(() => import('@/pages/LandingPage'));
const HomePage = React.lazy(() => import('@/pages/HomePage'));
const JobCenterPage = React.lazy(() => import('@/pages/JobCenterPage'));
const ResumeEditorPage = React.lazy(() => import('@/pages/ResumeEditorPage'));
const ResumePrintPage = React.lazy(() => import('@/pages/ResumePrintPage'));
const ResumeOptimizationHistoryPage = React.lazy(() => import('@/pages/ResumeOptimizationHistoryPage'));
const InterviewPage = React.lazy(() => import('@/pages/InterviewPage'));
const InterviewHistoryPage = React.lazy(
  () => import('@/pages/InterviewHistoryPage')
);
const InterviewResultPage = React.lazy(
  () => import('@/pages/InterviewResultPage')
);
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'));
const ProfileInsightsPage = React.lazy(() => import('@/pages/ProfileInsightsPage'));
const ProfileModelsPage = React.lazy(() => import('@/pages/ProfileModelsPage'));
const NotFoundPage = React.lazy(
  () => import('@/components/common/NotFoundPage')
);

const protectedPage = (element: React.ReactNode, allowGuest = false) =>
  React.createElement(ProtectedRoute, { allowGuest }, element);

// 路由配置
export const routes: RouteConfig[] = [
  { path: '/', element: React.createElement(LandingPage) },

  // 认证相关页面
  {
    path: '/auth',
    layout: React.createElement(AuthLayout),
    children: [{ path: 'login', element: React.createElement(LoginPage) }],
  },

  // 首页布局
  {
    path: '/',
    layout: React.createElement(HomeLayout),
    children: [
      { path: 'resumes', element: React.createElement(HomePage) },
      { path: 'resumes/:id/edit', element: protectedPage(React.createElement(ResumeEditorPage), true) },
      { path: 'resumes/:id/optimizations', element: protectedPage(React.createElement(ResumeOptimizationHistoryPage), true) },
      { path: 'jobs', element: protectedPage(React.createElement(JobCenterPage), true) },
      { path: 'interviews', element: protectedPage(React.createElement(InterviewPage), true) },
      { path: 'interviews/resume/:resumeId', element: protectedPage(React.createElement(InterviewPage), true) },
      { path: 'interviews/history', element: protectedPage(React.createElement(InterviewHistoryPage), true) },
      { path: 'interviews/results/:id', element: protectedPage(React.createElement(InterviewResultPage), true) },
      { path: 'profile', layout: protectedPage(React.createElement(ProfileLayout), true), children: [
        { path: '', element: React.createElement(ProfilePage) },
        { path: 'insights', element: React.createElement(ProfileInsightsPage) },
        { path: 'interviews', element: React.createElement(InterviewHistoryPage) },
        { path: 'models', element: React.createElement(ProfileModelsPage) },
      ] },
    ],
  },

  // 主要功能布局
  {
    path: '/resumes/:id/print',
    element: protectedPage(React.createElement(ResumePrintPage), true),
  },
  {
    path: '/resume/:id',
    element: protectedPage(React.createElement(ResumeEditorPage), true),
  },
  {
    path: '/resume/:id/print',
    element: protectedPage(React.createElement(ResumePrintPage), true),
  },
  {
    path: '/resume/interview',
    element: protectedPage(React.createElement(Navigate, { to: '/interviews', replace: true }), true),
  },
  {
    path: '/resume/interview/:resumeId',
    element: protectedPage(React.createElement(InterviewPage), true),
  },
  {
    path: '/resume/interview/history',
    element: protectedPage(React.createElement(Navigate, { to: '/interviews/history', replace: true }), true),
  },
  {
    path: '/resume/interview/result/:id',
    element: protectedPage(React.createElement(InterviewResultPage), true),
  },
  {
    path: '/history',
    element: protectedPage(React.createElement(Navigate, { to: '/interviews/history', replace: true }), true),
  },

  // 404 页面
  {
    path: '*',
    element: React.createElement(NotFoundPage),
  },
];

// 路由名称常量
export const ROUTE_NAMES = {
  LOGIN: '/auth/login',
  HOME: '/resumes',
  RESUME_EDITOR: '/resumes/:id/edit',
  RESUME_OPTIMIZATIONS: '/resumes/:id/optimizations',
  RESUME_INTERVIEW: '/interviews',
  JOBS: '/jobs',
  INTERVIEWS: '/interviews',
  HISTORY: '/interviews/history',
};

// 生成带参数的路由路径
export const generateRoutePath = (
  route: string,
  params?: Record<string, string>
): string => {
  let path = route;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
  }
  return path;
};
