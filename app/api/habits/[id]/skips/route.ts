export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logSkip, removeSkip, canSkip, getTokensRemaining } from '@/src/db/queries/skips'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: habitId } = await params
  try {
    const able = await canSkip(userId, habitId)
    const tokensRemaining = await getTokensRemaining(userId, habitId)
    return NextResponse.json({ canSkip: able, tokensRemaining })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check skip status' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: habitId } = await params
  try {
    const body = await request.json()
    const { date } = body

    const able = await canSkip(userId, habitId)
    if (!able) {
      return NextResponse.json({ error: 'No skip tokens remaining this month' }, { status: 400 })
    }

    const skip = await logSkip(userId, habitId, date)
    return NextResponse.json(skip, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log skip' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: habitId } = await params
  try {
    const body = await request.json()
    const { date } = body
    await removeSkip(userId, habitId, date)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove skip' }, { status: 500 })
  }
}