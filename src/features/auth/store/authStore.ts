import { create } from 'zustand';
import type { User } from '../auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('makanak_token'),
  setAuth: (user, token) => {
    localStorage.setItem('makanak_token', token);
    set({ user, token });
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    localStorage.removeItem('makanak_token');
    set({ user: null, token: null });
  },
  isAuthenticated: () => !!get().token,
}));
