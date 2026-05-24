'use client'
import type { HeatmapCell } from '../lib/reportSelectors'

interface MonthHeatmapProps {
  data: HeatmapCell[] // current month cells from getMonthCalendarData
}

const CELL = 28
const GAP = 4
const STEP = CELL + GAP
const DAY_LABEL_W = 26
const TOP_H = 16

const DAY_LABELS: Record<number, string> = { 0: 'S', 1: 'M', 2: 'T', 3: 'W', 4: 'T', 5: 'F', 6: 'S' }

function cellColor(status: string): string {
  switch (status) {
    case 'completed': return '#40c463'
    case 'skipped':   return '#b6d96c'
    case 'missed':    return '#ffcdd2'
    default:          return '#ebedf0'
  }
}

export default function MonthHeatmap({ data }: MonthHeatmapProps) {
  if (!data.length) return null

  const firstCell = data[0]
  const monthName = new Date(firstCell.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  })

  // Assign week column: based on day offset + first day of week
  const firstDayOfWeek = firstCell.dayOfWeek // 0=Sun of day 1
  const totalCols = Math.ceil((data.length + firstDayOfWeek) / 7)

  // Build week columns: each col = 7 slots (Sun–Sat)
  const cols: (HeatmapCell | null)[][] = Array.from({ length: totalCols }, () =>
    Array(7).fill(null)
  )
  data.forEach((cell) => {
    const dayIndex = parseInt(cell.date.slice(8), 10) - 1 // 0-based day
    const slot = dayIndex + firstDayOfWeek
    const col = Math.floor(slot / 7)
    const row = slot % 7
    cols[col][row] = cell
  })

  const svgW = DAY_LABEL_W + totalCols * STEP
  const svgH = TOP_H + 7 * STEP

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{monthName}</p>
      <div className="w-full sm:max-w-sm">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ display: 'block' }}
        >
          {/* Day-of-week labels */}
          {[0, 1, 2, 3, 4, 5, 6].map((di) => (
            <text
              key={di}
              x={0}
              y={TOP_H + di * STEP + CELL - 2}
              fontSize={10}
              fill="#aaa"
              fontFamily="system-ui, sans-serif"
            >
              {DAY_LABELS[di]}
            </text>
          ))}

          {/* Cells */}
          {cols.map((col, ci) =>
            col.map((cell, di) => {
              const x = DAY_LABEL_W + ci * STEP
              const y = TOP_H + di * STEP
              if (!cell) {
                return <rect key={`${ci}-${di}`} x={x} y={y} width={CELL} height={CELL} rx={2} fill="#ebedf0" opacity={0.3} />
              }
              const day = parseInt(cell.date.slice(8), 10)
              return (
                <g key={`${ci}-${di}`}>
                  <rect x={x} y={y} width={CELL} height={CELL} rx={2} fill={cellColor(cell.status)} />
                  <text
                    x={x + CELL / 2} y={y + CELL - 7}
                    fontSize={11}
                    fill={cell.status === 'completed' || cell.status === 'skipped' ? '#fff' : '#888'}
                    textAnchor="middle"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="500"
                  >
                    {day}
                  </text>
                </g>
              )
            })
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-2">
        {[
          { color: '#40c463', label: 'Done' },
          { color: '#b6d96c', label: 'Skipped' },
          { color: '#ffcdd2', label: 'Missed' },
          { color: '#ebedf0', label: 'Rest' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="rounded-sm" style={{ width: 8, height: 8, backgroundColor: color }} />
            <span className="text-[9px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
