'use client'
import { useState, useEffect } from 'react'
import { useHabitsStore } from '@/src/stores/habitsStore'
import CompletionHeatmap from '@/src/components/reports/CompletionHeatmap'
import StreakHistory from '@/src/components/reports/StreakHistory'
import MonthlyRate from '@/src/components/reports/MonthlyRate'
import TrendLine from '@/src/components/reports/TrendLine'
import * as reportSelectors from '@/src/lib/reportSelectors'
import * as habitUtils from '@/src/lib/habitUtils'

export default function ReportsPage() {
  const { habits } = useHabitsStore()
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [streakData, setStreakData] = useState<any[]>([])
  const [monthlyRateData, setMonthlyRateData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])

  const activeHabits = habits.filter((h) => !h.archived_at)
  const selectedHabit = selectedHabitId
    ? activeHabits.find((h) => h.id === selectedHabitId)
    : activeHabits[0]

  useEffect(() => {
    if (activeHabits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(activeHabits[0].id)
    }
  }, [activeHabits])

  useEffect(() => {
    if (selectedHabit) loadReportData()
  }, [selectedHabit?.id])

  const loadReportData = async () => {
    if (!selectedHabit) return

    setIsLoading(true)
    try {
      const [completionsRes, skipsRes] = await Promise.all([
        fetch(`/api/completions?habitId=${selectedHabit.id}`),
        fetch(`/api/skips?habitId=${selectedHabit.id}`),
      ])
      const completions = await completionsRes.json()
      const skips = await skipsRes.json()

      setHeatmapData(reportSelectors.getHeatmapData(selectedHabit, completions, skips))
      setStreakData(reportSelectors.getStreakHistory(selectedHabit, completions, skips))
      setMonthlyRateData(reportSelectors.getMonthlyRates(selectedHabit, completions, skips))
      setTrendData(reportSelectors.getTrendData(selectedHabit, completions))
    } catch (err) {
      console.error('Failed to load report data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (activeHabits.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-sm">No habits to report on yet</p>
      </div>
    )
  }

  const isTrack = selectedHabit ? habitUtils.isTrackMode(selectedHabit) : false

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#E5E5E5]">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Reports</h1>

        {/* Habit selector */}
        <select
          value={selectedHabitId || ''}
          onChange={(e) => setSelectedHabitId(e.target.value)}
          className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 focus:outline-none focus:border-[#185FA5]"
        >
          {activeHabits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.icon || '⭐'} {h.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {/* Heatmap (for non-track habits) */}
          {!isTrack && heatmapData.length > 0 && (
            <CompletionHeatmap data={heatmapData} />
          )}

          {/* Trend Line (only for track habits) */}
          {isTrack && trendData.length > 0 && selectedHabit && (
            <TrendLine
              data={trendData}
              unit={selectedHabit.goal_unit || ''}
              habitName={selectedHabit.name}
            />
          )}

          {/* Streak History */}
          {streakData.length > 0 && <StreakHistory streaks={streakData} />}

          {/* Monthly Rate (for non-track habits) */}
          {!isTrack && monthlyRateData.length > 0 && (
            <MonthlyRate data={monthlyRateData} />
          )}
        </div>
      )}
    </div>
  )
}
