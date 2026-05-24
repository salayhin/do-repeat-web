'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyRateData } from '../../lib/reportSelectors'

interface MonthlyRateProps {
  data: MonthlyRateData[]
}

export default function MonthlyRate({ data }: MonthlyRateProps) {
  if (!data || data.length === 0) {
    return (
      <div className="px-4 py-8 border-t border-[#E5E5E5] text-center text-sm text-gray-400">
        No monthly data available yet
      </div>
    )
  }

  const chartData = data.map((item) => {
    const [year, month] = item.month.split('-')
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
    })
    return {
      month: monthName,
      rate: Math.round(item.rate * 100),
      completed: item.completed,
      scheduled: item.scheduled,
    }
  })

  const averageRate = Math.round(
    (data.reduce((sum, item) => sum + item.rate, 0) / data.length) * 100
  )

  return (
    <div className="px-4 py-4 border-t border-[#E5E5E5]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Monthly Completion Rate</h3>
        <span className="text-sm font-semibold text-[#4CAF50]">Avg: {averageRate}%</span>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#666' }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#666' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Completion']}
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
          />
          <Bar dataKey="rate" fill="#4CAF50" radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
        {data.map((item, idx) => {
          const [year, month] = item.month.split('-')
          const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
            'en-US',
            { month: 'long', year: 'numeric' }
          )
          return (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{monthName}</span>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(item.rate * 100)}%
                </span>
                <span className="text-xs text-gray-400 ml-1.5">
                  {item.completed}/{item.scheduled}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
