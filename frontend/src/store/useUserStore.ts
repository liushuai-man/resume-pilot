import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GithubUser } from '@/types/index';

interface UserState {
  user: GithubUser | null;
  isLoggedIn: boolean;
  setUser: (user: GithubUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => {
        set({
          user,
          isLoggedIn: true,
        });
      },
      clearUser: () => {
        set({
          user: null,
          isLoggedIn: false,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);
