'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useHabitsStore } from '@/src/stores/habitsStore'
import { useUIStore } from '@/src/stores/uiStore'
import CheckInCard from '@/src/components/CheckInCard'
import QuantityModal from '@/src/components/QuantityModal'
import * as streakLib from '@/src/lib/streaks'
import { getLocalDate } from '@/src/lib/dateUtils'

interface HabitDayData {
  habit: any
  isCompleted: boolean
  isSkipped: boolean
  currentStreak: number
  completionRate: number
  completionValue: number
  completions: any[]
  skips: any[]
  weeklyCount?: number
  weeklyTarget?: number
}

export default function TodayPage() {
  const { habits, isLoading: habitsLoading } = useHabitsStore()
  const { timezone } = useUIStore()
  const [selectedDate, setSelectedDate] = useState(() => getLocalDate(timezone))
  const [isLoading, setIsLoading] = useState(false)
  const [habitData, setHabitData] = useState<HabitDayData[]>([])
  const [quantityModalVisible, setQuantityModalVisible] = useState(false)
  const [selectedHabitData, setSelectedHabitData] = useState<HabitDayData | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const PAGE_SIZE = 10

  const today = getLocalDate(timezone)
  const isToday = selectedDate === today
  const displayDate = new Date(selectedDate + 'T00:00:00')

  useEffect(() => {
    if (habits.length > 0) {
      loadDayData()
    }
  }, [habits, selectedDate])

  useEffect(() => { setPage(0) }, [selectedDate, search])

  const loadDayData = async () => {
    setIsLoading(true)
    try {
      const scheduledHabits = habits.filter((h) =>
        streakLib.isScheduledForDate(h, selectedDate) &&
        (!h.version_start_date || selectedDate >= h.version_start_date)
      )

      const data = await Promise.all(
        scheduledHabits.map(async (habit) => {
          const [completionsRes, skipsRes] = await Promise.all([
            fetch(`/api/completions?habitId=${habit.id}`),
            fetch(`/api/skips?habitId=${habit.id}`),
          ])
          const completions = await completionsRes.json()
          const skips = await skipsRes.json()

          const isCompleted = streakLib.isCompletedForDate(completions, selectedDate)
          const isSkipped = streakLib.isSkippedForDate(skips, selectedDate)
          const isFrequency = habit.schedule_type === 'frequency'
          const currentStreak = isFrequency
            ? streakLib.computeWeeklyStreak(habit, completions)
            : streakLib.computeCurrentStreak(habit, completions, skips)
          const completionRate = isFrequency
            ? streakLib.computeWeeklyCompletionRate(habit, completions)
            : streakLib.computeCompletionRate(habit, completions, skips, 30)
          const weeklyCount = isFrequency ? streakLib.getCompletionsThisWeek(completions) : undefined
          const weeklyTarget = isFrequency ? (habit.frequency_target ?? undefined) : undefined
          const todayCompletion = completions.find((c: any) => c.date === selectedDate)

          return {
            habit,
            isCompleted,
            isSkipped,
            currentStreak,
            completionRate,
            completionValue: todayCompletion?.value || 0,
            completions,
            skips,
            weeklyCount,
            weeklyTarget,
          }
        })
      )

      setHabitData(data)
    } catch (err) {
      console.error('Failed to load day data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const completedCount = useMemo(
    () => habitData.filter((d) => d.isCompleted || d.isSkipped).length,
    [habitData]
  )

  const filteredHabitData = useMemo(() => {
    if (!search.trim()) return habitData
    const q = search.toLowerCase()
    return habitData.filter((d) => d.habit.name.toLowerCase().includes(q))
  }, [habitData, search])

  const totalPages = Math.ceil(filteredHabitData.length / PAGE_SIZE)
  const pagedHabitData = filteredHabitData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toLocalDateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const handleDateChange = (val: string) => {
    if (val && val <= today) setSelectedDate(val)
  }

  if (habitsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <img src="/do-repeat-logo.svg" alt="Loading" className="w-16 h-16 animate-pulse" />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No habits yet</h2>
        <p className="text-gray-500 mb-6">Create your first habit to start tracking</p>
        <Link
          href="/habit/create"
          className="px-5 py-3 bg-[#185FA5] text-white rounded-lg font-semibold hover:bg-[#0C447C] transition-colors"
        >
          + Create Habit
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isToday ? 'Check In' : displayDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {displayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Calendar date picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click()}
              className="w-9 h-9 rounded-lg border border-[#E5E5E5] flex items-center justify-center text-gray-500 hover:border-[#185FA5] hover:text-[#185FA5] transition-colors text-base"
              aria-label="Pick a date"
            >
              📅
            </button>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => handleDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <Link
            href="/habit/create"
            className="w-10 h-10 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-2xl font-bold hover:bg-[#0C447C] transition-colors"
          >
            +
          </Link>
        </div>
      </div>

      {/* Summary bar */}
      {habitData.length > 0 && (
        <div className="px-4 py-2.5 bg-gray-50 border-b border-[#E5E5E5]">
          <p className="text-sm font-semibold text-gray-500">
            {completedCount} of {habitData.length} completed
          </p>
          {habitData.length > 0 && (
            <div className="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-[#4CAF50] rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / habitData.length) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Search bar */}
      {habitData.length > 0 && (
        <div className="px-4 py-2 border-b border-[#E5E5E5]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search habits…"
              className="w-full pl-8 pr-8 py-2 text-sm border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#185FA5] bg-gray-50"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-3 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : habitData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">😴</div>
            <p className="text-gray-400 text-sm">No habits scheduled for this day</p>
          </div>
        ) : filteredHabitData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 text-sm">No habits match &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <div>
            {pagedHabitData.map((item) => (
              <div key={item.habit.id}>
                <CheckInCard
                  habit={item.habit}
                  streak={item.currentStreak}
                  completionRate={item.completionRate}
                  isCompleted={item.isCompleted}
                  isSkipped={item.isSkipped}
                  date={selectedDate}
                  completionValue={item.completionValue}
                  weeklyCount={item.weeklyCount}
                  weeklyTarget={item.weeklyTarget}
                  onUpdate={loadDayData}
                  onQuantityClick={
                    item.habit.type !== 'binary'
                      ? () => {
                          setSelectedHabitData(item)
                          setQuantityModalVisible(true)
                        }
                      : undefined
                  }
                />
              </div>
            ))}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-3 pb-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="px-4 py-1.5 text-sm font-semibold text-[#185FA5] border border-[#E5E5E5] rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500 font-medium">
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-1.5 text-sm font-semibold text-[#185FA5] border border-[#E5E5E5] rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quantity Modal */}
      {selectedHabitData && (
        <QuantityModal
          visible={quantityModalVisible}
          habit={selectedHabitData.habit}
          currentValue={selectedHabitData.completionValue}
          date={selectedDate}
          onClose={() => {
            setQuantityModalVisible(false)
            setSelectedHabitData(null)
          }}
          onSave={() => {
            setQuantityModalVisible(false)
            setSelectedHabitData(null)
            loadDayData()
          }}
        />
      )}
    </div>
  )
}
