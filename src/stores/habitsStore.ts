'use client'
import { create } from 'zustand'
import type { Habit } from '../db/schema'

interface HabitsStore {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  initializeHabits: () => Promise<void>
  refreshHabits: () => Promise<void>
  addHabit: (data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'archived_at'>) => Promise<Habit>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit | null>
  archiveHabit: (id: string) => Promise<void>
  getHabit: (id: string) => Habit | undefined
}

export const useHabitsStore = create<HabitsStore>((set, get) => ({
  habits: [],
  isLoading: false,
  error: null,

  initializeHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/habits')
      if (!res.ok) throw new Error('Failed to load habits')
      const habits = await res.json()
      set({ habits, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load habits'
      set({ error: errorMessage, isLoading: false })
    }
  },

  refreshHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/habits')
      if (!res.ok) throw new Error('Failed to refresh habits')
      const habits = await res.json()
      set({ habits, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh habits'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  addHabit: async (data) => {
    set({ error: null })
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create habit')
      const newHabit = await res.json()
      set((state) => ({ habits: [...state.habits, newHabit] }))
      return newHabit
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create habit'
      set({ error: errorMessage })
      throw error
    }
  },

  updateHabit: async (id, updates) => {
    set({ error: null })
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, createVersion: false }),
      })
      if (!res.ok) throw new Error('Failed to update habit')
      const updatedHabit = await res.json()
      set((state) => ({
        habits: state.habits.map((h) => (h.id === id ? updatedHabit : h)),
      }))
      return updatedHabit
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update habit'
      set({ error: errorMessage })
      throw error
    }
  },

  archiveHabit: async (id) => {
    set({ error: null })
    try {
      const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to archive habit')
      set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to archive habit'
      set({ error: errorMessage })
      throw error
    }
  },

  getHabit: (id) => {
    return get().habits.find((h) => h.id === id)
  },
}))
