export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const meta = user.publicMetadata as Record<string, string>
  return NextResponse.json({
    timezone: meta?.timezone || 'UTC',
    reminderTime: meta?.reminderTime || '08:00',
  })
}

export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const existing = (user.publicMetadata as Record<string, string>) || {}

  await client.users.updateUser(userId, {
    publicMetadata: { ...existing, ...body },
  })

  return NextResponse.json({ ok: true })
}
