import { eq, and, sql } from 'drizzle-orm'
import { db } from '../client'
import { habit_skips, skip_token_usage, type HabitSkip } from '../schema'
import { v4 as uuidv4 } from 'uuid'

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7) // YYYY-MM
}

export async function logSkip(userId: string, habitId: string, date: string): Promise<HabitSkip> {
  const id = uuidv4()
  const now = new Date().toISOString()
  const month = date.slice(0, 7)

  // Insert skip
  const [skip] = await db
    .insert(habit_skips)
    .values({ id, habit_id: habitId, user_id: userId, date, month, created_at: now })
    .returning()

  // Upsert token usage - increment
  await db
    .insert(skip_token_usage)
    .values({ habit_id: habitId, user_id: userId, month, tokens_used: 1, tokens_max: 3 })
    .onConflictDoUpdate({
      target: [skip_token_usage.habit_id, skip_token_usage.month],
      set: {
        tokens_used: sql`${skip_token_usage.tokens_used} + 1`,
      },
    })

  return skip
}

export async function removeSkip(userId: string, habitId: string, date: string): Promise<void> {
  const month = date.slice(0, 7)

  await db
    .delete(habit_skips)
    .where(
      and(
        eq(habit_skips.habit_id, habitId),
        eq(habit_skips.user_id, userId),
        eq(habit_skips.date, date)
      )
    )

  // Decrement token usage (don't go below 0)
  await db
    .update(skip_token_usage)
    .set({ tokens_used: sql`GREATEST(${skip_token_usage.tokens_used} - 1, 0)` })
    .where(
      and(eq(skip_token_usage.habit_id, habitId), eq(skip_token_usage.month, month))
    )
}

export async function getSkipsByHabit(userId: string, habitId: string): Promise<HabitSkip[]> {
  return db
    .select()
    .from(habit_skips)
    .where(and(eq(habit_skips.habit_id, habitId), eq(habit_skips.user_id, userId)))
    .orderBy(habit_skips.date)
}

export async function canSkip(userId: string, habitId: string): Promise<boolean> {
  const remaining = await getTokensRemaining(userId, habitId)
  return remaining > 0
}

export async function getTokensRemaining(userId: string, habitId: string): Promise<number> {
  const month = getCurrentMonth()
  const [usage] = await db
    .select()
    .from(skip_token_usage)
    .where(
      and(eq(skip_token_usage.habit_id, habitId), eq(skip_token_usage.month, month))
    )

  if (!usage) return 3 // default max
  return Math.max(0, (usage.tokens_max || 3) - (usage.tokens_used || 0))
}
