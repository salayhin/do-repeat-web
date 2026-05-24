'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import type { Habit } from '../db/schema'

interface CheckInCardProps {
  habit: Habit
  streak: number
  completionRate: number
  isCompleted: boolean
  isSkipped: boolean
  date: string
  completionValue?: number
  weeklyCount?: number
  weeklyTarget?: number
  onUpdate: () => void
  onQuantityClick?: () => void
}

export default function CheckInCard({
  habit,
  streak,
  completionRate,
  isCompleted,
  isSkipped,
  date,
  completionValue,
  weeklyCount,
  weeklyTarget,
  onUpdate,
  onQuantityClick,
}: CheckInCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const isBinary = habit.type === 'binary'

  const handleCardClick = async () => {
    if (!isBinary) {
      onQuantityClick?.()
      return
    }

    setIsLoading(true)
    try {
      if (isCompleted) {
        await fetch(`/api/habits/${habit.id}/completions?date=${date}`, { method: 'DELETE' })
      } else {
        await fetch(`/api/habits/${habit.id}/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, value: 1 }),
        })
      }
      onUpdate()
    } catch (err) {
      console.error('Failed to toggle completion:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setMenuOpen(false)
    try {
      const res = await fetch(`/api/habits/${habit.id}/skips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      if (!res.ok) {
        showToast('Could not skip. Please try again.')
        return
      }
      onUpdate()
    } catch (err) {
      console.error('Failed to skip:', err)
    }
  }

  const handleUnskip = async () => {
    setMenuOpen(false)
    try {
      await fetch(`/api/habits/${habit.id}/skips`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      })
      onUpdate()
    } catch (err) {
      console.error('Failed to unskip:', err)
    }
  }

  return (
    <div
      className={`relative flex items-center gap-3 px-3 py-3 rounded-lg border mb-2.5 transition-colors ${
        isCompleted || isSkipped
          ? 'bg-[#F9FFF9] border-green-100'
          : 'bg-white border-[#E5E5E5]'
      }`}
    >
      {/* Icon circle */}
      <button
        type="button"
        onClick={handleCardClick}
        disabled={isLoading}
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: habit.color || '#185FA5' }}
      >
        {habit.icon || null}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{habit.name}</p>
        {habit.type === 'quantitative' && (
          <p className="text-xs text-gray-500 mt-0.5">
            {habit.goal_mode === 'target'
              ? `Goal: ${habit.goal_value} ${habit.goal_unit}${completionValue ? ` · Done: ${completionValue}` : ''}`
              : `Track: ${habit.goal_unit}${completionValue ? ` · ${completionValue}` : ''}`}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mr-1">
        {weeklyTarget !== undefined ? (
          <div className="text-center">
            <p className={`text-sm font-bold ${weeklyCount !== undefined && weeklyCount >= weeklyTarget ? 'text-green-600' : 'text-[#0C447C]'}`}>
              {weeklyCount ?? 0}/{weeklyTarget}
            </p>
            <p className="text-[10px] text-gray-400">this wk</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-bold text-[#0C447C]">{streak}</p>
            <p className="text-[10px] text-gray-400">🔥</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-bold text-[#0C447C]">{Math.round(completionRate * 100)}%</p>
          <p className="text-[10px] text-gray-400">{weeklyTarget !== undefined ? '12wk' : '30d'}</p>
        </div>
      </div>

      {/* Status badge */}
      {isLoading ? (
        <div className="w-8 h-8 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin flex-shrink-0" />
      ) : isCompleted ? (
        <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      ) : isSkipped ? (
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">⊘</span>
        </div>
      ) : isBinary ? (
        <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] bg-gray-50 flex-shrink-0" />
      ) : (
        <button
          type="button"
          onClick={onQuantityClick}
          className="w-8 h-8 rounded-full border-2 border-[#185FA5] flex items-center justify-center flex-shrink-0 hover:bg-blue-50 transition-colors"
        >
          <span className="text-[#185FA5] text-xs font-bold">+</span>
        </button>
      )}

      {/* Skip token toast */}
      {toast && (
        <div className="absolute -top-8 left-0 right-0 flex justify-center pointer-events-none">
          <span className="bg-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            {toast}
          </span>
        </div>
      )}

      {/* Menu button */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded"
        >
          ···
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-7 z-20 bg-white border border-[#E5E5E5] rounded-lg shadow-lg py-1 w-36">
              <Link
                href={`/habit/${habit.id}`}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                View details
              </Link>
              {isSkipped ? (
                <button
                  type="button"
                  onClick={handleUnskip}
                  className="w-full text-left px-3 py-2 text-sm text-amber-600 hover:bg-gray-50"
                >
                  Remove skip
                </button>
              ) : (
                !isCompleted && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mark as skipped
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
