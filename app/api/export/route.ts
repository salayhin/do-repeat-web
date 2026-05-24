export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { listActiveHabits } from '@/src/db/queries/habits'
import { getCompletionsByHabit } from '@/src/db/queries/completions'

export async function GET(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    const habits = await listActiveHabits(userId)

    if (format === 'csv') {
      // Build CSV
      const rows: string[] = []
      rows.push('habit_id,habit_name,date,value,completed_at')

      for (const habit of habits) {
        const completions = await getCompletionsByHabit(userId, habit.id)
        for (const c of completions) {
          rows.push(
            [
              JSON.stringify(c.habit_id),
              JSON.stringify(habit.name),
              JSON.stringify(c.date),
              c.value?.toString() ?? '',
              JSON.stringify(c.completed_at),
            ].join(',')
          )
        }
      }

      const csv = rows.join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="do-repeat-export.csv"',
        },
      })
    }

    // JSON format
    const result = await Promise.all(
      habits.map(async (habit) => {
        const completions = await getCompletionsByHabit(userId, habit.id)
        return { ...habit, completions }
      })
    )

    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="do-repeat-export.json"',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}