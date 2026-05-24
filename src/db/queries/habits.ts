import { eq, and, isNull } from 'drizzle-orm'
import { db } from '../client'
import { habits, type Habit, type HabitInsert } from '../schema'
import { v4 as uuidv4 } from 'uuid'

export async function createHabit(
  userId: string,
  input: Omit<HabitInsert, 'id' | 'user_id' | 'created_at'>
): Promise<Habit> {
  const id = uuidv4()
  const now = new Date().toISOString().split('T')[0]
  const [habit] = await db
    .insert(habits)
    .values({
      ...input,
      id,
      user_id: userId,
      version_start_date: input.version_start_date || now,
    })
    .returning()
  return habit
}

export async function getHabit(userId: string, id: string): Promise<Habit | null> {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.user_id, userId)))
  return habit || null
}

export async function listActiveHabits(userId: string): Promise<Habit[]> {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.user_id, userId), isNull(habits.archived_at)))
    .orderBy(habits.created_at)
}

export async function updateHabit(
  userId: string,
  id: string,
  updates: Partial<HabitInsert>
): Promise<Habit | null> {
  const [updated] = await db
    .update(habits)
    .set(updates)
    .where(and(eq(habits.id, id), eq(habits.user_id, userId)))
    .returning()
  return updated || null
}

export async function archiveHabit(userId: string, id: string): Promise<void> {
  await db
    .update(habits)
    .set({ archived_at: new Date() })
    .where(and(eq(habits.id, id), eq(habits.user_id, userId)))
}

export async function createHabitVersion(
  userId: string,
  id: string,
  updates: Partial<HabitInsert>
): Promise<Habit | null> {
  // Get existing habit
  const existing = await getHabit(userId, id)
  if (!existing) return null

  // Archive the old one
  await archiveHabit(userId, id)

  // Create new with version+1
  const newId = uuidv4()
  const now = new Date().toISOString().split('T')[0]
  const [newHabit] = await db
    .insert(habits)
    .values({
      ...existing,
      ...updates,
      id: newId,
      user_id: userId,
      version: (existing.version || 1) + 1,
      version_start_date: now,
      archived_at: null,
      created_at: undefined,
    })
    .returning()
  return newHabit
}

export async function getHabitByShareToken(token: string): Promise<Habit | null> {
  const [habit] = await db
    .select()
    .from(habits)
    .where(eq(habits.share_token, token))
  return habit || null
}
