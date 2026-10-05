import { create } from 'zustand'
import type { AuthSession } from '@/types'

interface AuthState {
  session: AuthSession | null
  isLoading: boolean
  setSession: (session: AuthSession | null) => void
  setLoading: (v: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ session: null, isLoading: false }),
}))