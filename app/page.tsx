import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function Home() {
  const { userId } = await auth()
  if (userId) redirect('/check-in')

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/do-repeat-logo.svg" alt="Do Repeat" className="w-8 h-8" />
          <span className="text-lg font-bold">do repeat</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-semibold text-[#185FA5] hover:underline"
          >
            Log in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold bg-[#185FA5] text-white px-4 py-2 rounded-lg hover:bg-[#0C447C] transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#185FA5] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span>✦</span> Free to use — no credit card required
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Build habits that<br />
          <span className="text-[#185FA5]">actually stick.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Do Repeat helps you track daily habits, maintain streaks, and see your progress over time — all in one clean, focused app.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#185FA5] text-white text-base font-semibold hover:bg-[#0C447C] transition-colors shadow-sm"
          >
            Get started free →
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-[#E5E5E5] text-gray-700 text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          Everything you need to build better habits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 p-6 rounded-2xl border border-[#E5E5E5] hover:border-[#185FA5] hover:shadow-sm transition-all"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#185FA5] text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Start your streak today.
        </h2>
        <p className="text-gray-500 mb-8">
          Free forever. No ads. No noise. Just your habits.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-[#185FA5] text-white text-base font-semibold hover:bg-[#0C447C] transition-colors shadow-sm"
        >
          Create your account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] px-6 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Do Repeat. Built for consistency.
      </footer>

    </div>
  )
}

const FEATURES = [
  {
    icon: '✅',
    title: 'Daily Check-ins',
    description: 'Mark habits done with a single tap. Binary habits toggle instantly, quantitative ones let you log the exact value.',
  },
  {
    icon: '🔥',
    title: 'Streaks',
    description: 'Day-by-day streaks for fixed habits. Week-by-week streaks for flexible frequency habits. Both tracked automatically.',
  },
  {
    icon: '📊',
    title: 'Daily Heatmap',
    description: 'A full year of history in one view. Green for done, gray for rest — just like your GitHub contribution graph.',
  },
  {
    icon: '📈',
    title: 'Progress Charts',
    description: 'Monthly completion rates and trend lines for quantitative habits like weight, steps, or reading pages.',
  },
  {
    icon: '⏭️',
    title: 'Guilt-free Rest Days',
    description: 'Life happens. Take as many rest days as you need — your streak stays intact.',
  },
  {
    icon: '🔔',
    title: 'Email Reminders',
    description: 'Get a daily reminder email at the time you choose, adjusted to your timezone.',
  },
  {
    icon: '🗓️',
    title: 'Flexible Scheduling',
    description: 'Daily, specific days of the week (Mon/Wed/Fri), or a weekly frequency goal (3×/week) — you set the rhythm.',
  },
  {
    icon: '📦',
    title: 'Data Export',
    description: 'Download all your data as CSV or JSON anytime. Your data is always yours.',
  },
  {
    icon: '🔗',
    title: 'Share Your Streaks',
    description: 'Generate a shareable link for any habit. Paste it anywhere — a rich preview card appears.',
  },
]

const STEPS = [
  {
    title: 'Create a habit',
    description: 'Name it, pick an icon and color, set your schedule and reminder. Takes under a minute.',
  },
  {
    title: 'Check in daily',
    description: "Open the app, mark what you've done. That's it. The streaks take care of themselves.",
  },
  {
    title: 'Watch yourself improve',
    description: 'Review your heatmap, streaks, and monthly rates to stay motivated and spot patterns.',
  },
]
