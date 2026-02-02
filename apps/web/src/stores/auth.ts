'use client'
import create from 'zustand';

type State = { user?: { id: string; email: string }; setUser: (u?: State['user']) => void };

export const useAuthStore = create<State>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
}));

export default useAuthStore;
