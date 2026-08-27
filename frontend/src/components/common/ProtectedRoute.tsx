import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth.api';
import { useUserStore } from '@/store/useUserStore';

interface ProtectedRouteProps {
  children?: ReactNode;
  allowGuest?: boolean;
}

export default function ProtectedRoute({ children, allowGuest = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { setUser, clearUser, isGuest, isLoggedIn } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isGuest || isLoggedIn) {
      setIsChecking(false);
      setIsAuthenticated(isLoggedIn);
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
  }, [clearUser, isGuest, isLoggedIn, setUser]);

  if (isChecking) {
    return null;
  }

  if (!isAuthenticated && (!isGuest || !allowGuest)) {
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
