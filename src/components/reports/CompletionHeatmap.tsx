'use client'
import { useState } from 'react'
import type { HeatmapCell } from '../../lib/reportSelectors'

interface CompletionHeatmapProps {
  data: HeatmapCell[]
}

const CELL = 10
const GAP = 2
const STEP = CELL + GAP
const DAY_LABEL_W = 26
const MONTH_LABEL_H = 28

const DAY_LABELS: Record<number, string> = { 1: 'Mon', 3: 'Wed', 5: 'Fri' }

function cellColor(status: string): string {
  switch (status) {
    case 'completed': return '#40c463'
    case 'skipped':   return '#6b7280'
    case 'missed':    return '#ebedf0'
    default:          return '#ebedf0'
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export default function CompletionHeatmap({ data }: CompletionHeatmapProps) {
  const [tooltip, setTooltip] = useState<HeatmapCell | null>(null)

  if (!data.length) return null

  const numWeeks = (data[data.length - 1]?.week ?? 0) + 1
  const weekCols: (HeatmapCell | null)[][] = Array.from({ length: numWeeks }, (_, wi) =>
    Array.from({ length: 7 }, (_, di) =>
      data.find((c) => c.week === wi && c.dayOfWeek === di) ?? null
    )
  )

  const monthLabels: { label: string; weekIndex: number }[] = []
  const seen = new Set<string>()
  for (const cell of data) {
    const month = cell.date.slice(0, 7)
    if (!seen.has(month)) {
      seen.add(month)
      const d = new Date(cell.date + 'T00:00:00')
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      monthLabels.push({ label, weekIndex: cell.week })
    }
  }

  const svgW = DAY_LABEL_W + numWeeks * STEP
  const svgH = MONTH_LABEL_H + 7 * STEP

  return (
    <div className="px-4 py-4 bg-white">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Last {numWeeks} Weeks</h3>

      <div className="overflow-x-auto">
        <svg width={svgW} height={svgH} style={{ display: 'block', minWidth: svgW }}>
          {/* Month labels */}
          {monthLabels.map(({ label, weekIndex }, i) => {
            const prev = monthLabels[i - 1]
            if (prev && weekIndex - prev.weekIndex < 4) return null
            const [mon, yr] = label.split(' ')
            const x = DAY_LABEL_W + weekIndex * STEP
            return (
              <g key={label + weekIndex}>
                <text x={x} y={11} fontSize={9} fontWeight="600" fill="#555" fontFamily="system-ui, sans-serif">{mon}</text>
                <text x={x} y={21} fontSize={8} fill="#999" fontFamily="system-ui, sans-serif">{yr ? `'${yr}` : ''}</text>
              </g>
            )
          })}

          {/* Day labels */}
          {[0, 1, 2, 3, 4, 5, 6].map((di) => {
            const label = DAY_LABELS[di]
            if (!label) return null
            return (
              <text key={di} x={0} y={MONTH_LABEL_H + di * STEP + CELL - 2} fontSize={9} fill="#767676" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            )
          })}

          {/* Cells */}
          {weekCols.map((week, wi) =>
            week.map((cell, di) => {
              const x = DAY_LABEL_W + wi * STEP
              const y = MONTH_LABEL_H + di * STEP
              if (!cell) {
                return <rect key={`${wi}-${di}`} x={x} y={y} width={CELL} height={CELL} rx={2} ry={2} fill="#ebedf0" />
              }
              const isActive = tooltip?.date === cell.date
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={x} y={y} width={CELL} height={CELL} rx={2} ry={2}
                  fill={cellColor(cell.status)}
                  stroke={isActive ? '#185FA5' : 'none'}
                  strokeWidth={isActive ? 1.5 : 0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTooltip(isActive ? null : cell)}
                >
                  <title>{`${cell.date}: ${cell.status}${cell.value !== undefined ? ` (${cell.value})` : ''}`}</title>
                </rect>
              )
            })
          )}
        </svg>
      </div>

      {tooltip && (
        <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg border border-[#E5E5E5] text-sm inline-block">
          <span className="font-semibold text-gray-900">{formatDate(tooltip.date)}</span>
          <span className="ml-2 capitalize text-gray-500">{tooltip.status}</span>
          {tooltip.value !== undefined && (
            <span className="ml-2 text-gray-400 text-xs">({tooltip.value})</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-2 justify-end">
        {[
          { color: '#ebedf0', label: 'No data' },
          { color: '#40c463', label: 'Completed' },
          { color: '#6b7280', label: 'Skipped' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="rounded-sm" style={{ width: CELL, height: CELL, backgroundColor: color }} />
            <span className="text-[10px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
