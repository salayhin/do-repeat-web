export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getCompletionsByHabit,
  getCompletionsByDateRange,
} from '@/src/db/queries/completions'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const habitId = searchParams.get('habitId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!habitId) return NextResponse.json({ error: 'habitId required' }, { status: 400 })

    let completions
    if (startDate && endDate) {
      completions = await getCompletionsByDateRange(userId, habitId, startDate, endDate)
    } else {
      completions = await getCompletionsByHabit(userId, habitId)
    }

    return NextResponse.json(completions)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 })
  }
}