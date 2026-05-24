import { eq, and, gte, lte } from 'drizzle-orm'
import { db } from '../client'
import { habit_completions, type HabitCompletion } from '../schema'
import { v4 as uuidv4 } from 'uuid'

export async function logCompletion(
  userId: string,
  habitId: string,
  date: string,
  value: number = 1
): Promise<HabitCompletion> {
  const id = uuidv4()
  const now = new Date().toISOString()
  const [completion] = await db
    .insert(habit_completions)
    .values({ id, habit_id: habitId, user_id: userId, date, value, completed_at: now })
    .onConflictDoUpdate({
      target: [habit_completions.habit_id, habit_completions.date],
      set: { value, completed_at: now },
    })
    .returning()
  return completion
}

export async function deleteCompletion(
  userId: string,
  habitId: string,
  date: string
): Promise<void> {
  await db
    .delete(habit_completions)
    .where(
      and(
        eq(habit_completions.habit_id, habitId),
        eq(habit_completions.user_id, userId),
        eq(habit_completions.date, date)
      )
    )
}

export async function getCompletionsByHabit(
  userId: string,
  habitId: string
): Promise<HabitCompletion[]> {
  return db
    .select()
    .from(habit_completions)
    .where(
      and(eq(habit_completions.habit_id, habitId), eq(habit_completions.user_id, userId))
    )
    .orderBy(habit_completions.date)
}

export async function getCompletionsByDateRange(
  userId: string,
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HabitCompletion[]> {
  return db
    .select()
    .from(habit_completions)
    .where(
      and(
        eq(habit_completions.habit_id, habitId),
        eq(habit_completions.user_id, userId),
        gte(habit_completions.date, startDate),
        lte(habit_completions.date, endDate)
      )
    )
    .orderBy(habit_completions.date)
}
