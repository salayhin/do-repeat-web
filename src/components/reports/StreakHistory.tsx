'use client'
import type { StreakRecord } from '../../lib/reportSelectors'

interface StreakHistoryProps {
  streaks: StreakRecord[]
}

export default function StreakHistory({ streaks }: StreakHistoryProps) {
  const current = streaks.find((s) => s.type === 'current')
  const best = streaks.find((s) => s.type === 'best')

  return (
    <div className="px-4 py-4 border-t border-[#E5E5E5]">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Streaks</h3>
      <div className="flex gap-4">
        <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-[#E5E5E5]">
          <p className="text-4xl font-bold text-[#0C447C]">
            {current?.count ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Current Streak 🔥</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center border border-[#E5E5E5]">
          <p className="text-4xl font-bold text-[#0C447C]">
            {best?.count ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Best Streak 🏆</p>
        </div>
      </div>
    </div>
  )
}
