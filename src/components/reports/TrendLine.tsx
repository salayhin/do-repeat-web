'use client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TrendPoint } from '../../lib/reportSelectors'

interface TrendLineProps {
  data: TrendPoint[]
  unit: string
  habitName: string
}

export default function TrendLine({ data, unit, habitName }: TrendLineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-gray-400">
        No trend data available yet
      </div>
    )
  }

  const chartData = data.map((point) => ({
    date: point.date.slice(5), // MM-DD
    value: point.value,
  }))

  const values = data.filter((p) => p.value !== null).map((p) => p.value as number)
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0

  return (
    <div className="px-4 py-4 border-t border-[#E5E5E5]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{habitName} – Last 30 Days</h3>
        {values.length > 0 && (
          <span className="text-sm text-gray-500">
            Avg: {avg.toFixed(1)} {unit}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#666' }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#666' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) =>
              value != null ? [`${value} ${unit}`, habitName] : ['—', habitName]
            }
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#185FA5"
            strokeWidth={2}
            dot={{ r: 3, fill: '#185FA5' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
