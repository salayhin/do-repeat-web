import { redirect } from 'next/navigation'
import { getHabitByShareToken } from '@/src/db/queries/habits'
import { getCompletionsByHabit } from '@/src/db/queries/completions'
import { getSkipsByHabit } from '@/src/db/queries/skips'
import * as streakLib from '@/src/lib/streaks'

interface Props {
  params: Promise<{ token: string }>
}

export default async function SharePage({ params }: Props) {
  const { token } = await params
  const habit = await getHabitByShareToken(token)

  if (!habit) {
    redirect('/today')
  }

  // Fetch stats
  const completions = await getCompletionsByHabit(habit.user_id, habit.id)
  const skips = await getSkipsByHabit(habit.user_id, habit.id)
  const currentStreak = streakLib.computeCurrentStreak(habit, completions, skips)
  const completionRate = streakLib.computeCompletionRate(habit, completions, skips, 30)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4"
          style={{ backgroundColor: habit.color || '#185FA5' }}
        >
          {habit.icon || '⭐'}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{habit.name}</h1>
        <p className="text-sm text-gray-500 mb-6">habit streak</p>

        <div className="flex gap-4 justify-center mb-8">
          <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-[#E5E5E5]">
            <p className="text-3xl font-bold text-[#0C447C]">{currentStreak}</p>
            <p className="text-xs text-gray-500 mt-1">Current Streak 🔥</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-[#E5E5E5]">
            <p className="text-3xl font-bold text-[#0C447C]">{Math.round(completionRate * 100)}%</p>
            <p className="text-xs text-gray-500 mt-1">30-Day Rate</p>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Shared from <span className="font-semibold">Do Repeat</span>
        </p>
        <a
          href="/"
          className="mt-4 inline-block text-sm font-semibold text-[#185FA5] hover:underline"
        >
          Start tracking your habits →
        </a>
      </div>
    </div>
  )
}
