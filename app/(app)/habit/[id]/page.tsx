'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useHabitsStore } from '@/src/stores/habitsStore'
import * as streakLib from '@/src/lib/streaks'
import * as reportSelectors from '@/src/lib/reportSelectors'
import MonthHeatmap from '@/src/components/MonthHeatmap'

export default function HabitDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { archiveHabit } = useHabitsStore()

  const [isLoading, setIsLoading] = useState(true)
  const [habit, setHabit] = useState<any>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)
  const [monthHeatmap, setMonthHeatmap] = useState<any[]>([])
  const [isArchiving, setIsArchiving] = useState(false)

  useEffect(() => {
    loadHabitDetails()
  }, [id])

  const loadHabitDetails = async () => {
    try {
      const [habitRes, completionsRes, skipsRes] = await Promise.all([
        fetch(`/api/habits/${id}`),
        fetch(`/api/completions?habitId=${id}`),
        fetch(`/api/skips?habitId=${id}`),
      ])

      if (!habitRes.ok) {
        router.push('/check-in')
        return
      }

      const habitData = await habitRes.json()
      const completions = await completionsRes.json()
      const skips = await skipsRes.json()

      setHabit(habitData)

      const currentStreak = streakLib.computeCurrentStreak(habitData, completions, skips)
      setStreak(currentStreak)

      const best = streakLib.computeBestStreak(habitData, completions, skips)
      setBestStreak(best)

      const rate = streakLib.computeCompletionRate(habitData, completions, skips, 30)
      setCompletionRate(rate)

      setMonthHeatmap(reportSelectors.getMonthCalendarData(habitData, completions, skips))
    } catch (err) {
      console.error('Failed to load habit:', err)
      router.push('/check-in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!confirm(`Archive "${habit.name}"? You can't undo this.`)) return
    setIsArchiving(true)
    try {
      await archiveHabit(id)
      router.push('/check-in')
    } catch (err) {
      alert('Failed to archive habit')
      setIsArchiving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!habit) return null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-[#E5E5E5]">
        <Link href="/check-in" className="text-sm font-semibold text-[#185FA5] mr-3">
          ← Back
        </Link>
        <h1 className="text-base font-bold text-gray-900 flex-1">{habit.name}</h1>
      </div>

      {/* Icon + Name */}
      <div className="flex flex-col items-center py-6 border-b border-[#E5E5E5]">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3"
          style={{ backgroundColor: habit.color || '#185FA5' }}
        >
          {habit.icon || '⭐'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{habit.name}</h2>
      </div>

      {/* Stats Grid */}
      <div className="flex gap-3 px-4 py-4 border-b border-[#E5E5E5]">
        {[
          { value: streak, label: 'Current Streak 🔥' },
          { value: bestStreak, label: 'Best Streak' },
          { value: `${Math.round(completionRate * 100)}%`, label: '30-Day Rate' },
        ].map(({ value, label }) => (
          <div
            key={label}
            className="flex-1 py-4 px-3 bg-gray-50 rounded-xl text-center border border-[#E5E5E5]"
          >
            <p className="text-2xl font-bold text-[#0C447C]">{value}</p>
            <p className="text-[11px] text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly heatmap */}
      <div className="px-4 py-4 border-b border-[#E5E5E5]">
        <h3 className="text-sm font-bold text-gray-900 mb-3">This Month</h3>
        <MonthHeatmap data={monthHeatmap} />
      </div>

      {/* Details */}
      <div className="px-4 py-4 border-b border-[#E5E5E5]">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Details</h3>
        <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-3">
            <span className="text-sm text-gray-500">Type</span>
            <span className="text-sm font-semibold text-gray-900">
              {habit.type === 'binary'
                ? 'Binary'
                : `${habit.goal_mode === 'target' ? 'Target' : 'Track'} – ${habit.goal_unit}`}
            </span>
          </div>
          <div className="border-t border-[#E5E5E5] flex items-center justify-between px-3 py-3">
            <span className="text-sm text-gray-500">Schedule</span>
            <span className="text-sm font-semibold text-gray-900">
              {habit.schedule_type === 'daily'
                ? 'Daily'
                : habit.schedule_type === 'weekly'
                ? 'Specific days'
                : `${habit.frequency_target}× per week`}
            </span>
          </div>
          {habit.reminder_enabled === 1 && (
            <div className="border-t border-[#E5E5E5] flex items-center justify-between px-3 py-3">
              <span className="text-sm text-gray-500">Reminder</span>
              <span className="text-sm font-semibold text-gray-900">{habit.reminder_time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-4 py-4">
        <Link
          href={`/habit/${id}/edit`}
          className="flex-1 py-3 bg-[#185FA5] rounded-lg text-sm font-semibold text-white text-center hover:bg-[#0C447C] transition-colors"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={handleArchive}
          disabled={isArchiving}
          className="flex-1 py-3 border border-[#D32F2F] rounded-lg text-sm font-semibold text-[#D32F2F] hover:bg-red-50 transition-colors disabled:opacity-60"
        >
          {isArchiving ? 'Archiving...' : 'Archive'}
        </button>
      </div>
    </div>
  )
}
