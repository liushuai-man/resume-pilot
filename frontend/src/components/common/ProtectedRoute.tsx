import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth.api';
import { useUserStore } from '@/store/useUserStore';
import LoadingPage from './LoadingPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { setUser, clearUser, isGuest } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isGuest) {
      setIsChecking(false);
      setIsAuthenticated(false);
      return;
    }

    let active = true;

    const verifySession = async () => {
      try {
        const response = await getCurrentUser();
        if (!active) return;

        if (response.code === 200 && response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          clearUser();
        }
      } catch {
        if (active) clearUser();
      } finally {
        if (active) setIsChecking(false);
      }
    };

    void verifySession();

    return () => {
      active = false;
    };
  }, [clearUser, isGuest, setUser]);

  if (isChecking) {
    return <LoadingPage title="正在验证登录状态..." />;
  }

  if (!isAuthenticated && !isGuest) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
