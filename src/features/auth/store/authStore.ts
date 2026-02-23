import { create } from 'zustand';
import type { User } from '../auth.types';
import { storage } from '@/lib/storage';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storage.getUser<User>(),
  token: storage.getToken(),
  setAuth: (user, token) => {
    storage.setToken(token);
    storage.setUser(user);
    set({ user, token });
  },
  setUser: (user) => {
    storage.setUser(user);
    set({ user });
  },
  clearAuth: () => {
    storage.clear();
    set({ user: null, token: null });
  },
  isAuthenticated: () => !!get().token,
}));
