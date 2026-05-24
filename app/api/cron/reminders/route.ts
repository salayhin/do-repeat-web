export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { db } from '@/src/db/client'
import { habits } from '@/src/db/schema'
import { eq } from 'drizzle-orm'
import { sendReminderEmail } from '@/src/lib/email'
import { clerkClient } from '@clerk/nextjs/server'

function localHourInTimezone(timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).formatToParts(new Date())
    const h = parts.find((p) => p.type === 'hour')?.value
    return h ? parseInt(h, 10) % 24 : 0
  } catch {
    return new Date().getUTCHours()
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all habits with reminders enabled
    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.reminder_enabled, 1))

    if (allHabits.length === 0) return NextResponse.json({ sent: 0 })

    // Group by user_id
    const byUser: Record<string, typeof allHabits> = {}
    for (const habit of allHabits) {
      if (!byUser[habit.user_id]) byUser[habit.user_id] = []
      byUser[habit.user_id].push(habit)
    }

    const client = await clerkClient()
    let sent = 0

    for (const [userId, userHabits] of Object.entries(byUser)) {
      try {
        const user = await client.users.getUser(userId)
        const email = user.emailAddresses[0]?.emailAddress
        if (!email) continue

        const meta = user.publicMetadata as Record<string, string>
        const timezone = meta?.timezone || 'UTC'
        const reminderTime = meta?.reminderTime || '08:00'
        const localHour = localHourInTimezone(timezone)
        const [reminderHH] = reminderTime.split(':')

        // Only send when the user's local hour matches their global reminder time
        if (parseInt(reminderHH, 10) !== localHour) continue

        const dueHabits = userHabits

        if (dueHabits.length === 0) continue

        await sendReminderEmail(
          email,
          dueHabits.map((h) => ({ name: h.name, icon: h.icon || '⭐' }))
        )
        sent++
      } catch (err) {
        console.error(`Failed to send reminder to user ${userId}:`, err)
      }
    }

    return NextResponse.json({ sent })
  } catch (error) {
    console.error('[cron/reminders]', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
