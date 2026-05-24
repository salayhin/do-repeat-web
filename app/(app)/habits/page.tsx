'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useHabitsStore } from '@/src/stores/habitsStore'
import type { Habit } from '@/src/db/schema'

function scheduleLabel(habit: Habit): string {
  if (habit.schedule_type === 'daily') return 'Every day'
  if (habit.schedule_type === 'frequency') return `${habit.frequency_target ?? '?'}× per week`
  if (habit.schedule_type === 'weekly' && habit.schedule_days) {
    const days = (Array.isArray(habit.schedule_days)
      ? habit.schedule_days
      : JSON.parse(habit.schedule_days as string)) as string[]
    const labels: Record<string, string> = {
      sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed',
      thu: 'Thu', fri: 'Fri', sat: 'Sat',
    }
    return days.map((d) => labels[d] ?? d).join(', ')
  }
  return '—'
}

function typeLabel(habit: Habit): string {
  if (habit.type === 'binary') return 'Done / Not done'
  if (habit.goal_mode === 'target') return `Target: ${habit.goal_value} ${habit.goal_unit}`
  if (habit.goal_mode === 'track') return `Track: ${habit.goal_unit}`
  return 'Quantitative'
}

function scheduleChip(habit: Habit) {
  if (habit.schedule_type === 'daily') return { label: 'Daily', color: 'bg-blue-50 text-blue-700' }
  if (habit.schedule_type === 'frequency') return { label: 'Frequency', color: 'bg-purple-50 text-purple-700' }
  return { label: 'Specific Days', color: 'bg-amber-50 text-amber-700' }
}

export default function MyHabitsPage() {
  const { habits } = useHabitsStore()
  const [showArchived, setShowArchived] = useState(false)

  const active = habits.filter((h) => !h.archived_at)
  const archived = habits.filter((h) => h.archived_at)
  const displayed = showArchived ? archived : active

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
          <p className="text-xs text-gray-400 mt-0.5">{active.length} active habit{active.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/habit/create"
          className="w-10 h-10 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-2xl font-bold hover:bg-[#0C447C] transition-colors"
        >
          +
        </Link>
      </div>

      {/* Toggle active / archived */}
      <div className="flex gap-1 px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setShowArchived(false)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !showArchived ? 'bg-[#185FA5] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Active ({active.length})
        </button>
        <button
          type="button"
          onClick={() => setShowArchived(true)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            showArchived ? 'bg-[#185FA5] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Archived ({archived.length})
        </button>
      </div>

      {/* Habit list */}
      <div className="px-4 py-3 space-y-3">
        {displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🌱</div>
            <p className="text-gray-500 text-sm mb-4">
              {showArchived ? 'No archived habits yet.' : 'No habits yet. Create your first one!'}
            </p>
            {!showArchived && (
              <Link
                href="/habit/create"
                className="px-5 py-2.5 bg-[#185FA5] text-white rounded-lg text-sm font-semibold hover:bg-[#0C447C] transition-colors"
              >
                + Create Habit
              </Link>
            )}
          </div>
        )}

        {displayed.map((habit) => {
          const chip = scheduleChip(habit)
          return (
            <div
              key={habit.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-[#E5E5E5] hover:border-[#185FA5] hover:shadow-sm transition-all"
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: habit.color || '#185FA5' }}
              >
                {habit.icon || '⭐'}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 text-sm">{habit.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${chip.color}`}>
                    {chip.label}
                  </span>
                </div>

                {/* Schedule */}
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">Schedule:</span> {scheduleLabel(habit)}
                </p>

                {/* Type */}
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium text-gray-700">Tracking:</span> {typeLabel(habit)}
                </p>

                {/* Reminder */}
                {habit.reminder_enabled ? (
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">Reminder:</span> On
                  </p>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Link
                  href={`/habit/${habit.id}`}
                  className="text-xs font-semibold text-[#185FA5] hover:underline"
                >
                  Details
                </Link>
                {!habit.archived_at && (
                  <Link
                    href={`/habit/${habit.id}/edit`}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-700"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
