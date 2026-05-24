'use client'
import { useEffect } from 'react'
import { useHabitsStore } from '@/src/stores/habitsStore'

export function HabitsInitializer() {
  const initializeHabits = useHabitsStore((s) => s.initializeHabits)
  useEffect(() => {
    initializeHabits()
  }, [])
  return null
}
