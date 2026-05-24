export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listActiveHabits, createHabit } from '@/src/db/queries/habits'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const habits = await listActiveHabits(userId)
    return NextResponse.json(habits)
  } catch (error) {
    console.error('[GET /api/habits]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch habits', detail: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      name,
      icon,
      color,
      type,
      goal_mode,
      goal_value,
      goal_unit,
      schedule_type,
      schedule_days,
      frequency_target,
      reminder_enabled,
      reminder_time,
      version_start_date,
      version,
    } = body

    const habit = await createHabit(userId, {
      name,
      icon,
      color,
      type,
      goal_mode,
      goal_value,
      goal_unit,
      schedule_type,
      schedule_days,
      frequency_target,
      reminder_enabled: reminder_enabled ?? 0,
      reminder_time,
      version_start_date: version_start_date || new Date().toISOString().split('T')[0],
      version: version ?? 1,
    })

    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    console.error('[POST /api/habits]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create habit', detail: message }, { status: 500 })
  }
}