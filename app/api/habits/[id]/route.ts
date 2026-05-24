export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getHabit,
  updateHabit,
  archiveHabit,
  createHabitVersion,
} from '@/src/db/queries/habits'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const habit = await getHabit(userId, id)
    if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(habit)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const body = await request.json()
    const { updates, createVersion } = body

    let result
    if (createVersion) {
      result = await createHabitVersion(userId, id, updates)
    } else {
      result = await updateHabit(userId, id, updates)
    }

    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await archiveHabit(userId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to archive habit' }, { status: 500 })
  }
}