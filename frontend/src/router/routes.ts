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

// 页面组件（延迟加载）
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
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
const NotFoundPage = React.lazy(
  () => import('@/components/common/NotFoundPage')
);

const protectedPage = (element: React.ReactNode) =>
  React.createElement(ProtectedRoute, null, element);

// 路由配置
export const routes: RouteConfig[] = [
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
      { path: '', element: React.createElement(Navigate, { to: '/resumes', replace: true }) },
      { path: 'resumes', element: React.createElement(HomePage) },
      { path: 'resumes/:id/edit', element: protectedPage(React.createElement(ResumeEditorPage)) },
      { path: 'resumes/:id/optimizations', element: protectedPage(React.createElement(ResumeOptimizationHistoryPage)) },
      { path: 'jobs', element: protectedPage(React.createElement(JobCenterPage)) },
      { path: 'interviews', element: protectedPage(React.createElement(InterviewPage)) },
      { path: 'interviews/resume/:resumeId', element: protectedPage(React.createElement(InterviewPage)) },
      { path: 'interviews/history', element: protectedPage(React.createElement(InterviewHistoryPage)) },
      { path: 'interviews/results/:id', element: protectedPage(React.createElement(InterviewResultPage)) },
    ],
  },

  // 主要功能布局
  {
    path: '/resumes/:id/print',
    element: protectedPage(React.createElement(ResumePrintPage)),
  },
  {
    path: '/resume/:id',
    element: protectedPage(React.createElement(ResumeEditorPage)),
  },
  {
    path: '/resume/:id/print',
    element: protectedPage(React.createElement(ResumePrintPage)),
  },
  {
    path: '/resume/interview',
    element: protectedPage(React.createElement(Navigate, { to: '/interviews', replace: true })),
  },
  {
    path: '/resume/interview/:resumeId',
    element: protectedPage(React.createElement(InterviewPage)),
  },
  {
    path: '/resume/interview/history',
    element: protectedPage(React.createElement(Navigate, { to: '/interviews/history', replace: true })),
  },
  {
    path: '/resume/interview/result/:id',
    element: protectedPage(React.createElement(InterviewResultPage)),
  },
  {
    path: '/history',
    element: protectedPage(React.createElement(Navigate, { to: '/interviews/history', replace: true })),
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
