import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth()

  if (userId) {
    redirect('/today')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🔁</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Do Repeat</h1>
        <p className="text-lg text-gray-600 mb-8">
          Build habits that stick. Track your progress, maintain streaks, and become consistent.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#185FA5] text-white font-semibold hover:bg-[#0C447C] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-[#185FA5] text-[#185FA5] font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  )
}
