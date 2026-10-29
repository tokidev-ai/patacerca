import { create } from 'zustand';
import { Owner } from '@patacerca/core';

interface SessionState {
  phone: string | null;
  owner: Owner | null;
  isAuthenticated: boolean;
  setSession: (phone: string, owner: Owner | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  phone: null,
  owner: null,
  isAuthenticated: false,
  setSession: (phone, owner) =>
    set({
      phone,
      owner,
      isAuthenticated: true,
    }),
  clearSession: () =>
    set({
      phone: null,
      owner: null,
      isAuthenticated: false,
    }),
}));

