import { create } from 'zustand';
import { Walker, WalkerStatus } from '@patacerca/core';

interface WalkerSessionState {
  phone: string | null;
  walker: Walker | null;
  status: WalkerStatus;
  isAuthenticated: boolean;
  setSession: (phone: string, walker: Walker | null) => void;
  setStatus: (status: WalkerStatus) => void;
  updateWalker: (updates: Partial<Walker>) => void;
  clearSession: () => void;
}

export const useWalkerSessionStore = create<WalkerSessionState>((set) => ({
  phone: null,
  walker: null,
  status: 'pending',
  isAuthenticated: false,
  setSession: (phone, walker) =>
    set({
      phone,
      walker,
      status: walker?.status || 'pending',
      isAuthenticated: true,
    }),
  setStatus: (status) =>
    set((state) => ({
      status,
      walker: state.walker ? { ...state.walker, status } : null,
    })),
  updateWalker: (updates) =>
    set((state) => ({
      walker: state.walker ? { ...state.walker, ...updates } : null,
    })),
  clearSession: () =>
    set({
      phone: null,
      walker: null,
      status: 'pending',
      isAuthenticated: false,
    }),
}));

