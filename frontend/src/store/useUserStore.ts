import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GithubUser } from '@/types/index';

interface UserState {
  user: GithubUser | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  setUser: (user: GithubUser) => void;
  enterGuestMode: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isGuest: false,
      setUser: (user) => {
        set({
          user,
          isLoggedIn: true,
          isGuest: false,
        });
      },
      enterGuestMode: () => {
        set({
          user: null,
          isLoggedIn: false,
          isGuest: true,
        });
      },
      clearUser: () => {
        set({
          user: null,
          isLoggedIn: false,
          isGuest: false,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isGuest: state.isGuest,
      }),
    }
  )
);
