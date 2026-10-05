import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SessionRecord } from '@/types'
import { createId } from '@/utils/id'

interface SessionsState {
  sessions: SessionRecord[]
  addSession: (session: Omit<SessionRecord, 'id'>) => string
  getSession: (id: string) => SessionRecord | undefined
  deleteSession: (id: string) => void
  deleteAllSessions: () => void
  getSessionsInRange: (startDate: Date, endDate: Date) => SessionRecord[]
  getTotalStats: () => { totalSessions: number; totalDurationSec: number }
}

const SESSIONS_KEY = 'campusmood.sessions'

function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSessions(sessions: SessionRecord[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export const useSessionsStore = create<SessionsState>()(
  persist(
    (set, get) => ({
      sessions: loadSessions(),

      addSession: (sessionData) => {
        const id = createId('ses')
        const session: SessionRecord = { ...sessionData, id }
        const sessions = [...get().sessions, session]
        set({ sessions })
        saveSessions(sessions)
        return id
      },

      getSession: (id) => get().sessions.find(s => s.id === id),

      deleteSession: (id) => {
        const sessions = get().sessions.filter(s => s.id !== id)
        set({ sessions })
        saveSessions(sessions)
      },

      deleteAllSessions: () => {
        set({ sessions: [] })
        localStorage.removeItem(SESSIONS_KEY)
      },

      getSessionsInRange: (startDate, endDate) => {
        const start = startDate.getTime()
        const end = endDate.getTime()
        return get().sessions.filter(s => {
          const sessionTime = new Date(s.endedAt).getTime()
          return sessionTime >= start && sessionTime <= end
        })
      },

      getTotalStats: () => {
        const sessions = get().sessions
        return {
          totalSessions: sessions.length,
          totalDurationSec: sessions.reduce((sum, s) => sum + s.durationSec, 0),
        }
      },
    }),
    {
      name: 'campusmood-sessions',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
)