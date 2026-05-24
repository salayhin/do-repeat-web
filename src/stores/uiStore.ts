'use client'
import { create } from 'zustand'

interface UIStore {
  selectedDate: string // 'YYYY-MM-DD'
  timezone: string
  habitModalOpen: boolean
  habitDetailsModalOpen: boolean
  selectedHabitId: string | null
  isLoading: boolean

  setSelectedDate: (date: string) => void
  setTimezone: (tz: string) => void
  setHabitModalOpen: (open: boolean) => void
  setHabitDetailsModalOpen: (open: boolean, habitId?: string) => void
  setSelectedHabitId: (id: string | null) => void
  setIsLoading: (loading: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  timezone: 'UTC',
  habitModalOpen: false,
  habitDetailsModalOpen: false,
  selectedHabitId: null,
  isLoading: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setTimezone: (tz) => set({ timezone: tz }),

  setHabitModalOpen: (open) => set({ habitModalOpen: open }),

  setHabitDetailsModalOpen: (open, habitId) =>
    set({ habitDetailsModalOpen: open, selectedHabitId: habitId || null }),

  setSelectedHabitId: (id) => set({ selectedHabitId: id }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}))
