import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { RouteConfig } from './routes';
import LoadingPage from '@/components/common/LoadingPage';
interface RouterProviderProps {
  routes: RouteConfig[];
}
// 递归渲染路由
const renderRoutes = (routes: RouteConfig[]): React.ReactNode => {
  return routes.map((route, index) => {
    const { path, element, layout, children } = route;
    // 如果有子路由且有布局
    if (children && layout) {
      return (
        <Route key={index} path={path} element={layout}>
          {children.map((child, childIndex) => (
            <Route
              key={childIndex}
              path={child.path}
              element={
                <Suspense fallback={<LoadingPage />}>{child.element}</Suspense>
              }
            />
          ))}
        </Route>
      );
    }
    // 如果有子路由但没有布局
    if (children && !layout) {
      return children.map((child, childIndex) => (
        <Route
          key={childIndex}
          path={path ? `${path}/${child.path}` : child.path}
          element={
            <Suspense fallback={<LoadingPage />}>{child.element}</Suspense>
          }
        />
      ));
    }
    // 如果没有子路由但有布局
    if (!children && layout) {
      return (
        <Route key={index} path={path} element={layout}>
          <Route
            index
            element={<Suspense fallback={<LoadingPage />}>{element}</Suspense>}
          />
        </Route>
      );
    }
    // 没有子路由也没有布局
    return (
      <Route
        key={index}
        path={path}
        element={<Suspense fallback={<LoadingPage />}>{element}</Suspense>}
      />
    );
  });
};
export default function RouterProvider({ routes }: RouterProviderProps) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>{renderRoutes(routes)}</Routes>
    </Suspense>
  );
}
