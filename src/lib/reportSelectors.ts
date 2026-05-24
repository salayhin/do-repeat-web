import type { Habit, HabitCompletion, HabitSkip } from '../db/schema'
import * as streakLib from './streaks'

export interface HeatmapCell {
  date: string
  dayOfWeek: number // 0-6
  week: number // 0-11
  status: 'empty' | 'completed' | 'skipped' | 'missed'
  value?: number
}

export interface StreakRecord {
  type: 'current' | 'best'
  count: number
  startDate?: string
  endDate?: string
}

export interface MonthlyRateData {
  month: string // YYYY-MM
  rate: number // 0-1
  completed: number
  scheduled: number
}

export interface TrendPoint {
  date: string
  value: number | null
}

/**
 * Get heatmap data for last 12 weeks
 */
export function getHeatmapData(
  habit: Habit,
  completions: HabitCompletion[],
  skips: HabitSkip[],
  weeks: number = 52
): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const habitStartStr = habit.version_start_date
    ? habit.version_start_date.slice(0, 10)
    : todayStr
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - weeks * 7)

  let currentDate = new Date(startDate)
  let weekIndex = 0

  while (weekIndex < weeks) {
    const dayOfWeek = currentDate.getDay()

    const dateStr = currentDate.toISOString().split('T')[0]

    // Future dates and dates before habit was created are always empty
    const isFuture = dateStr > todayStr
    const isBeforeHabit = dateStr < habitStartStr

    const isScheduled = streakLib.isScheduledForDate(habit, dateStr)
    const isCompleted = streakLib.isCompletedForDate(completions, dateStr)
    const isSkipped = streakLib.isSkippedForDate(skips, dateStr)

    let status: 'empty' | 'completed' | 'skipped' | 'missed' = 'empty'
    if (isFuture || isBeforeHabit || !isScheduled) {
      status = 'empty'
    } else if (isCompleted) {
      status = 'completed'
    } else if (isSkipped) {
      status = 'skipped'
    } else {
      status = 'missed'
    }

    const value = completions.find((c) => c.date === dateStr)?.value ?? undefined

    cells.push({
      date: dateStr,
      dayOfWeek,
      week: weekIndex,
      status,
      value,
    })

    currentDate.setDate(currentDate.getDate() + 1)

    if (dayOfWeek === 6) {
      weekIndex++
    }
  }

  return cells
}

/**
 * Get streak history (current and best)
 */
export function getStreakHistory(
  habit: Habit,
  completions: HabitCompletion[],
  skips: HabitSkip[]
): StreakRecord[] {
  const current = streakLib.computeCurrentStreak(habit, completions, skips)
  const best = streakLib.computeBestStreak(habit, completions, skips)

  return [
    { type: 'current', count: current },
    { type: 'best', count: best },
  ]
}

/**
 * Get monthly completion rates for last 6 months
 */
export function getMonthlyRates(
  habit: Habit,
  completions: HabitCompletion[],
  skips: HabitSkip[],
  months: number = 6
): MonthlyRateData[] {
  const rates: MonthlyRateData[] = []
  const today = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    const month = date.toISOString().slice(0, 7) // YYYY-MM

    // Get all dates in this month
    const year = date.getFullYear()
    const monthNum = date.getMonth()
    const firstDay = new Date(year, monthNum, 1)
    const lastDay = new Date(year, monthNum + 1, 0)

    let scheduled = 0
    let completed = 0

    let currentDate = new Date(firstDay)
    while (currentDate <= lastDay) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const isScheduled = streakLib.isScheduledForDate(habit, dateStr)
      const isCompletedOrSkipped =
        streakLib.isCompletedForDate(completions, dateStr) ||
        streakLib.isSkippedForDate(skips, dateStr)

      if (isScheduled) {
        scheduled++
        if (isCompletedOrSkipped) {
          completed++
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    const rate = scheduled > 0 ? completed / scheduled : 0

    rates.push({ month, rate, completed, scheduled })
  }

  return rates
}

/**
 * Get trend data for track habits
 * Returns array of date/value pairs, null for missing days
 */
export function getTrendData(
  habit: Habit,
  completions: HabitCompletion[],
  days: number = 30
): TrendPoint[] {
  const points: TrendPoint[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - days)

  let currentDate = new Date(startDate)

  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const isScheduled = streakLib.isScheduledForDate(habit, dateStr)

    if (isScheduled) {
      const completion = completions.find((c) => c.date === dateStr)
      const value = completion ? completion.value : null

      points.push({ date: dateStr, value: value ?? null })
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return points
}

/**
 * Get last 6 streaks for bar chart
 */
export function getRecentStreaks(
  completions: HabitCompletion[],
  skips: HabitSkip[],
  habit: Habit
): { date: string; streak: number }[] {
  return []
}
