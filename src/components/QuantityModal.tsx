'use client'
import { useState } from 'react'
import type { Habit } from '../db/schema'

interface QuantityModalProps {
  visible: boolean
  habit: Habit
  currentValue: number
  date: string
  onClose: () => void
  onSave: (value: number) => void
}

export default function QuantityModal({
  visible,
  habit,
  currentValue,
  date,
  onClose,
  onSave,
}: QuantityModalProps) {
  const [value, setValue] = useState(currentValue > 0 ? currentValue.toString() : '')
  const [isLoading, setIsLoading] = useState(false)

  if (!visible) return null

  const handleSave = async () => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid value')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/habits/${habit.id}/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, value: numValue }),
      })
      if (!res.ok) throw new Error('Failed to save')
      onSave(numValue)
    } catch (err) {
      alert('Failed to save value')
    } finally {
      setIsLoading(false)
    }
  }

  const goalText =
    habit.goal_mode === 'target'
      ? `Goal: ${habit.goal_value} ${habit.goal_unit}`
      : `Track: ${habit.goal_unit}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-80 shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: habit.color || '#185FA5' }}
            >
              {habit.icon || null}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{habit.name}</p>
              <p className="text-xs text-gray-500">{goalText}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Enter value ({habit.goal_unit})
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            step="any"
            autoFocus
            className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-lg font-semibold text-center focus:outline-none focus:border-[#185FA5]"
          />
          {habit.goal_mode === 'target' && habit.goal_value && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4CAF50] rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (parseFloat(value || '0') / habit.goal_value) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {parseFloat(value || '0')} / {habit.goal_value} {habit.goal_unit}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#E5E5E5] rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-[#185FA5] rounded-lg text-sm font-semibold text-white hover:bg-[#0C447C] transition-colors disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
