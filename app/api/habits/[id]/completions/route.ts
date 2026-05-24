export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logCompletion, deleteCompletion } from '@/src/db/queries/completions'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: habitId } = await params
  try {
    const body = await request.json()
    const { date, value = 1 } = body
    const completion = await logCompletion(userId, habitId, date, value)
    return NextResponse.json(completion, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log completion' }, { status: 500 })
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
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
    await deleteCompletion(userId, habitId, date)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete completion' }, { status: 500 })
  }
}