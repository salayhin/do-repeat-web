export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { db } from '@/src/db/client'
import { habits } from '@/src/db/schema'
import { eq, isNull } from 'drizzle-orm'
import { sendReminderEmail } from '@/src/lib/email'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const currentHour = now.getUTCHours().toString().padStart(2, '0')
    const currentMinute = '00' // We run hourly, so only match :00

    // Get all habits with reminders enabled that match current hour
    const allHabits = await db
      .select()
      .from(habits)
      .where(eq(habits.reminder_enabled, 1))

    // Filter by reminder time matching current hour
    const dueHabits = allHabits.filter((h) => {
      if (!h.reminder_time) return false
      const [hh] = h.reminder_time.split(':')
      return hh === currentHour
    })

    if (dueHabits.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // Group by user_id
    const byUser: Record<string, typeof dueHabits> = {}
    for (const habit of dueHabits) {
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

        await sendReminderEmail(
          email,
          userHabits.map((h) => ({
            name: h.name,
            icon: h.icon || '⭐',
          }))
        )
        sent++
      } catch (err) {
        console.error(`Failed to send reminder to user ${userId}:`, err)
      }
    }

    return NextResponse.json({ sent })
  } catch (error) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}