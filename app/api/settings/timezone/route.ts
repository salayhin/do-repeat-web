export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  const timezone = (user.publicMetadata?.timezone as string) || 'UTC'
  return NextResponse.json({ timezone })
}

export async function PUT(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { timezone } = await request.json()
  if (!timezone) return NextResponse.json({ error: 'Missing timezone' }, { status: 400 })

  const client = await clerkClient()
  await client.users.updateUser(userId, {
    publicMetadata: { timezone },
  })

  return NextResponse.json({ timezone })
}
