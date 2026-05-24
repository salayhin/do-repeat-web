export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSkipsByHabit } from '@/src/db/queries/skips'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const habitId = searchParams.get('habitId')
    if (!habitId) return NextResponse.json({ error: 'habitId required' }, { status: 400 })

    const skips = await getSkipsByHabit(userId, habitId)
    return NextResponse.json(skips)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch skips' }, { status: 500 })
  }
}