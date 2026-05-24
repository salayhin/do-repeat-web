import type { Habit } from '../db/schema'

/**
 * Check if a habit is in track mode (quantitative with no goal value)
 */
export const isTrackMode = (habit: Habit): boolean =>
  habit.type === 'quantitative' && habit.goal_mode === 'track'

/**
 * Check if a habit is in target mode (quantitative with goal value)
 */
export const isTargetMode = (habit: Habit): boolean =>
  habit.type === 'quantitative' && habit.goal_mode === 'target'

/**
 * Get display label for habit type
 */
export const getHabitTypeLabel = (habit: Habit): string => {
  if (habit.type === 'binary') return 'Binary'
  if (isTargetMode(habit)) return `Target - ${habit.goal_unit}`
  if (isTrackMode(habit)) return `Track - ${habit.goal_unit}`
  return 'Unknown'
}
