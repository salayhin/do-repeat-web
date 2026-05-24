'use client'
import { useEffect } from 'react'
import { useHabitsStore } from '@/src/stores/habitsStore'
import { useUIStore } from '@/src/stores/uiStore'
import { getLocalDate } from '@/src/lib/dateUtils'

export function HabitsInitializer() {
  const initializeHabits = useHabitsStore((s) => s.initializeHabits)
  const { setTimezone, setSelectedDate } = useUIStore()

  useEffect(() => {
    initializeHabits()
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.timezone) {
          setTimezone(d.timezone)
          setSelectedDate(getLocalDate(d.timezone))
        }
      })
      .catch(() => {})
  }, [])

  return null
}
