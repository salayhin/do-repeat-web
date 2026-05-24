'use client'
import { useState } from 'react'
import type { HeatmapCell } from '../../lib/reportSelectors'

interface CompletionHeatmapProps {
  data: HeatmapCell[]
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function cellBg(status: string): string {
  switch (status) {
    case 'completed': return 'bg-[#40c463]'
    case 'skipped':   return 'bg-[#b6d96c]'
    case 'missed':    return 'bg-red-200'
    default:          return 'bg-[#ebedf0]'
  }
}

function cellText(status: string): string {
  switch (status) {
    case 'completed':
    case 'skipped':   return 'text-white'
    default:          return 'text-gray-500'
  }
}

export default function CompletionHeatmap({ data }: CompletionHeatmapProps) {
  const [tooltip, setTooltip] = useState<HeatmapCell | null>(null)

  if (!data.length) return null

  const firstDate = new Date(data[0].date + 'T00:00:00')
  const monthName = firstDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Build a grid: pad empty cells before the 1st of month
  const firstDayOfWeek = data[0].dayOfWeek // 0=Sun
  const paddingCells = firstDayOfWeek // empty cells before day 1

  // Split into weeks (rows of 7)
  const gridCells: (HeatmapCell | null)[] = [
    ...Array(paddingCells).fill(null),
    ...data,
  ]
  // Pad end to complete last row
  while (gridCells.length % 7 !== 0) gridCells.push(null)

  const weeks: (HeatmapCell | null)[][] = []
  for (let i = 0; i < gridCells.length; i += 7) {
    weeks.push(gridCells.slice(i, i + 7))
  }

  return (
    <div className="px-4 py-4 bg-white">
      {/* Month heading */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">{monthName}</h3>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((cell, di) => {
              if (!cell) {
                return <div key={di} className="aspect-square rounded-md bg-transparent" />
              }
              const day = parseInt(cell.date.slice(8), 10)
              const isActive = tooltip?.date === cell.date
              return (
                <button
                  key={di}
                  type="button"
                  onClick={() => setTooltip(isActive ? null : cell)}
                  className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-semibold transition-opacity hover:opacity-80 ${cellBg(cell.status)} ${cellText(cell.status)} ${isActive ? 'ring-2 ring-[#185FA5] ring-offset-1' : ''}`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg border border-[#E5E5E5] text-sm inline-block">
          <span className="font-semibold text-gray-900">
            {new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            })}
          </span>
          <span className="ml-2 capitalize text-gray-500">{tooltip.status}</span>
          {tooltip.value !== undefined && (
            <span className="ml-2 text-gray-400 text-xs">({tooltip.value})</span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 justify-end">
        {[
          { color: 'bg-[#ebedf0]', label: 'No data' },
          { color: 'bg-[#40c463]', label: 'Completed' },
          { color: 'bg-[#b6d96c]', label: 'Skipped' },
          { color: 'bg-red-200',   label: 'Missed' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="text-[10px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
