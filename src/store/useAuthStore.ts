import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserData } from '../types';

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setUserData: (data: UserData | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserData: (data) => set({ userData: data }),
  setLoading: (loading) => set({ loading }),
}));
