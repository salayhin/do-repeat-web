import type { Habit } from '../db/schema'
import { addDays, parseISO, eachDayOfInterval } from 'date-fns'

// Pure functions for streak calculation (no side effects, no DB calls)

export function isScheduledForDate(habit: Habit, date: string): boolean {
  // Parse date string YYYY-MM-DD to get day of week
  const parts = date.split('-')
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1 // JavaScript months are 0-indexed
  const day = parseInt(parts[2], 10)

  const dateObj = new Date(year, month, day)
  const dayOfWeek = dateObj.getDay()
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const dayName = dayNames[dayOfWeek]

  if (habit.schedule_type === 'daily') {
    return true
  }

  if (habit.schedule_type === 'weekly' && habit.schedule_days) {
    const scheduledDays = Array.isArray(habit.schedule_days)
      ? habit.schedule_days
      : JSON.parse(habit.schedule_days as string)
    return (scheduledDays as string[]).includes(dayName)
  }

  if (habit.schedule_type === 'frequency') {
    return true
  }

  return false
}

export function isCompletedForDate(completions: any[], date: string): boolean {
  return completions.some((c) => c.date === date && c.value > 0)
}

export function isSkippedForDate(skips: any[], date: string): boolean {
  return skips.some((s) => s.date === date)
}

export function computeCurrentStreak(habit: Habit, completions: any[], skips: any[]): number {
  if (completions.length === 0 && skips.length === 0) {
    return 0
  }

  // Find the most recent date from either completions or skips
  const allDates = [
    ...completions.map((c) => c.date),
    ...skips.map((s) => s.date),
  ]

  if (allDates.length === 0) {
    return 0
  }

  // Find most recent date (lexicographically last for YYYY-MM-DD format)
  const mostRecentDateStr = allDates.sort().reverse()[0]

  let streak = 0
  let currentDateStr = mostRecentDateStr

  // Work backwards from the most recent date using date strings
  const maxIterations = 1000 // Prevent infinite loops
  for (let i = 0; i < maxIterations; i++) {
    // Skip days that aren't scheduled
    if (!isScheduledForDate(habit, currentDateStr)) {
      currentDateStr = subtractOneDay(currentDateStr)
      continue
    }

    // Check if completed or skipped
    if (isCompletedForDate(completions, currentDateStr) || isSkippedForDate(skips, currentDateStr)) {
      streak++
      currentDateStr = subtractOneDay(currentDateStr)
    } else {
      // Not completed and not skipped = streak broken
      break
    }
  }

  return streak
}

// Helper function to subtract one day from a date string in YYYY-MM-DD format
function subtractOneDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().split('T')[0]
}

export function computeBestStreak(habit: Habit, completions: any[], skips: any[]): number {
  if (completions.length === 0 && skips.length === 0) {
    return 0
  }

  let maxStreak = 0
  let currentStreak = 0
  let lastDateChecked: string | null = null

  const allDates = new Set([
    ...completions.map((c) => c.date),
    ...skips.map((s) => s.date),
  ])

  const sortedDates = Array.from(allDates).sort()

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i]

    // Check if there's a gap (missed day) between last date and current date
    if (lastDateChecked) {
      const lastDate = parseISO(lastDateChecked)
      const currentDate = parseISO(date)
      const daysDiff = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      // If gap > 1 day and next day in gap was scheduled but not completed/skipped, reset streak
      if (daysDiff > 1) {
        const gapStart = addDays(lastDate, 1)
        const gapEnd = addDays(currentDate, -1)
        const gapInterval = eachDayOfInterval({ start: gapStart, end: gapEnd })

        for (const gapDate of gapInterval) {
          const gapDateStr = gapDate.toISOString().split('T')[0]
          if (isScheduledForDate(habit, gapDateStr)) {
            currentStreak = 0
            break
          }
        }
      }
    }

    if (!isScheduledForDate(habit, date)) {
      lastDateChecked = date
      continue
    }

    if (isCompletedForDate(completions, date) || isSkippedForDate(skips, date)) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    }

    lastDateChecked = date
  }

  return maxStreak
}

export function getCompletionsThisWeek(completions: any[]): number {
  const today = new Date()
  const sunday = new Date(today)
  sunday.setDate(today.getDate() - today.getDay())
  const sundayStr = sunday.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  return completions.filter((c) => c.date >= sundayStr && c.date <= todayStr && c.value > 0).length
}

export function computeWeeklyStreak(habit: Habit, completions: any[]): number {
  const target = habit.frequency_target ?? 1
  if (completions.length === 0) return 0

  const today = new Date()
  let streak = 0

  // Start from last completed week (skip current in-progress week)
  let weekSunday = new Date(today)
  weekSunday.setDate(today.getDate() - today.getDay() - 7)

  for (let i = 0; i < 52; i++) {
    const weekSat = new Date(weekSunday)
    weekSat.setDate(weekSunday.getDate() + 6)

    const sunStr = weekSunday.toISOString().split('T')[0]
    const satStr = weekSat.toISOString().split('T')[0]

    if (habit.version_start_date && satStr < habit.version_start_date.slice(0, 10)) break

    const count = completions.filter(
      (c) => c.date >= sunStr && c.date <= satStr && c.value > 0
    ).length

    if (count >= target) {
      streak++
    } else {
      break
    }

    weekSunday.setDate(weekSunday.getDate() - 7)
  }

  return streak
}

export function computeWeeklyCompletionRate(habit: Habit, completions: any[], weeks: number = 12): number {
  const target = habit.frequency_target ?? 1
  if (completions.length === 0) return 0

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  let metWeeks = 0
  let totalWeeks = 0

  let weekSunday = new Date(today)
  weekSunday.setDate(today.getDate() - today.getDay())

  for (let i = 0; i < weeks; i++) {
    const weekSat = new Date(weekSunday)
    weekSat.setDate(weekSunday.getDate() + 6)

    const sunStr = weekSunday.toISOString().split('T')[0]
    if (sunStr > todayStr) { weekSunday.setDate(weekSunday.getDate() - 7); continue }

    const endStr = i === 0 ? todayStr : weekSat.toISOString().split('T')[0]
    const count = completions.filter(
      (c) => c.date >= sunStr && c.date <= endStr && c.value > 0
    ).length

    totalWeeks++
    if (count >= target) metWeeks++

    weekSunday.setDate(weekSunday.getDate() - 7)
  }

  if (totalWeeks === 0) return 0
  return Math.round((metWeeks / totalWeeks) * 100) / 100
}

export function computeCompletionRate(
  habit: Habit,
  completions: any[],
  skips: any[],
  days: number = 30
): number {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - days)

  let scheduledDays = 0
  let completedDays = 0

  // Iterate through each day in the range
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]

    if (isScheduledForDate(habit, dateStr)) {
      scheduledDays++

      if (isCompletedForDate(completions, dateStr) || isSkippedForDate(skips, dateStr)) {
        completedDays++
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  if (scheduledDays === 0) return 0
  return Math.round((completedDays / scheduledDays) * 100) / 100
}
