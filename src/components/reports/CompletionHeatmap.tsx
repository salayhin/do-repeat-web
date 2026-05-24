'use client'
import { useState } from 'react'
import type { HeatmapCell } from '../../lib/reportSelectors'

interface CompletionHeatmapProps {
  data: HeatmapCell[]
}

function getCellColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#2E7D32'
    case 'skipped':
      return '#F9A825'
    case 'missed':
      return '#EF9A9A'
    default:
      return '#F0F0F0'
  }
}

export default function CompletionHeatmap({ data }: CompletionHeatmapProps) {
  const [tooltip, setTooltip] = useState<HeatmapCell | null>(null)

  // Group by week
  const weeks: HeatmapCell[][] = []
  for (let i = 0; i < 12; i++) {
    weeks.push(data.filter((cell) => cell.week === i))
  }

  const CELL_SIZE = 14
  const CELL_GAP = 3
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="px-4 py-4 bg-white">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Last 12 Weeks</h3>

      <div className="overflow-x-auto">
        <div className="flex gap-1 mb-1 pl-8">
          {weeks.map((_, wi) => (
            <div key={wi} className="flex-1 text-center" style={{ minWidth: CELL_SIZE }}>
              <span className="text-[9px] text-gray-400">W{wi + 1}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels on left */}
          <div className="flex flex-col gap-[3px] w-7">
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-center text-[9px] text-gray-400"
                style={{ height: CELL_SIZE }}
              >
                {d}
              </div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] flex-1" style={{ minWidth: CELL_SIZE }}>
              {Array.from({ length: 7 }, (_, di) => {
                const cell = week.find((c) => c.dayOfWeek === di)
                if (!cell) {
                  return (
                    <div
                      key={di}
                      style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: 'transparent' }}
                    />
                  )
                }
                return (
                  <div
                    key={di}
                    onClick={() => setTooltip(tooltip?.date === cell.date ? null : cell)}
                    className="rounded-sm cursor-pointer hover:opacity-80 transition-opacity relative"
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: getCellColor(cell.status),
                      border: '1px solid rgba(0,0,0,0.05)',
                    }}
                    title={`${cell.date}: ${cell.status}`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 justify-center">
        {[
          { status: 'completed', label: 'Completed' },
          { status: 'skipped', label: 'Skipped' },
          { status: 'missed', label: 'Missed' },
          { status: 'empty', label: 'Rest' },
        ].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getCellColor(status) }}
            />
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip popup */}
      {tooltip && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-[#E5E5E5] text-sm">
          <p className="font-semibold text-gray-900">
            {new Date(tooltip.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-gray-600 mt-0.5 capitalize">{tooltip.status}</p>
          {tooltip.value !== undefined && (
            <p className="text-gray-500 text-xs mt-0.5">Value: {tooltip.value}</p>
          )}
        </div>
      )}
    </div>
  )
}
