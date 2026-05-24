'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useHabitsStore } from '@/src/stores/habitsStore'
import ColorPicker from '@/src/components/ColorPicker'
import IconPicker from '@/src/components/IconPicker'
import SchedulePicker from '@/src/components/SchedulePicker'

type FormStep = 'basic' | 'type' | 'schedule' | 'reminder'

export default function EditHabitPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { refreshHabits } = useHabitsStore()

  const [isInitializing, setIsInitializing] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<FormStep>('basic')
  const [originalValues, setOriginalValues] = useState<any>(null)

  // Form state
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💧')
  const [color, setColor] = useState('#1D9E75')
  const [type, setType] = useState<'binary' | 'quantitative'>('binary')
  const [goalMode, setGoalMode] = useState<'target' | 'track'>('target')
  const [goalValue, setGoalValue] = useState('')
  const [goalUnit, setGoalUnit] = useState('')
  const [scheduleType, setScheduleType] = useState<'daily' | 'weekly' | 'frequency'>('daily')
  const [scheduleDays, setScheduleDays] = useState<string[]>([])
  const [frequencyTarget, setFrequencyTarget] = useState(3)
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')

  useEffect(() => {
    loadHabit()
  }, [id])

  const loadHabit = async () => {
    try {
      const res = await fetch(`/api/habits/${id}`)
      if (!res.ok) { router.push('/check-in'); return }
      const habit = await res.json()

      const days = Array.isArray(habit.schedule_days)
        ? habit.schedule_days
        : habit.schedule_days
        ? JSON.parse(habit.schedule_days)
        : []

      setName(habit.name)
      setIcon(habit.icon || '💧')
      setColor(habit.color || '#1D9E75')
      setType(habit.type)
      setGoalMode(habit.goal_mode || 'target')
      setGoalValue(habit.goal_value?.toString() || '')
      setGoalUnit(habit.goal_unit || '')
      setScheduleType(habit.schedule_type)
      setScheduleDays(days)
      setFrequencyTarget(habit.frequency_target || 3)
      setReminderEnabled(habit.reminder_enabled === 1)
      setReminderTime(habit.reminder_time || '09:00')

      setOriginalValues({
        schedule_type: habit.schedule_type,
        schedule_days: days,
        frequency_target: habit.frequency_target,
        type: habit.type,
        goal_mode: habit.goal_mode,
        goal_value: habit.goal_value,
        goal_unit: habit.goal_unit,
      })
    } catch (err) {
      router.push('/check-in')
    } finally {
      setIsInitializing(false)
    }
  }

  const isVersionTriggeringChange = (): boolean => {
    if (!originalValues) return false
    const current = {
      schedule_type: scheduleType,
      schedule_days: scheduleDays,
      frequency_target: frequencyTarget,
      type,
      goal_mode: goalMode,
      goal_value: goalValue ? parseFloat(goalValue) : null,
      goal_unit: goalUnit,
    }
    return Object.keys(current).some(
      (k) => JSON.stringify((current as any)[k]) !== JSON.stringify(originalValues[k])
    )
  }

  const handleNext = () => {
    if (step === 'basic') {
      if (!name.trim()) { alert('Please enter a habit name'); return }
      setStep('type')
    } else if (step === 'type') {
      if (type === 'quantitative' && goalMode === 'target' && !goalValue.trim()) {
        alert('Please enter a goal value'); return
      }
      if (type === 'quantitative' && !goalUnit.trim()) {
        alert('Please enter a unit'); return
      }
      setStep('schedule')
    } else if (step === 'schedule') {
      if (scheduleType === 'weekly' && scheduleDays.length === 0) {
        alert('Please select at least one day'); return
      }
      setStep('reminder')
    }
  }

  const handleBack = () => {
    if (step === 'type') setStep('basic')
    else if (step === 'schedule') setStep('type')
    else if (step === 'reminder') setStep('schedule')
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const createVersion = isVersionTriggeringChange()
      const updates: any = {
        name: name.trim(),
        icon,
        color,
        reminder_enabled: reminderEnabled ? 1 : 0,
        reminder_time: reminderTime,
      }

      if (createVersion) {
        updates.schedule_type = scheduleType
        updates.schedule_days = scheduleType === 'weekly' ? scheduleDays : null
        updates.frequency_target = scheduleType === 'frequency' ? frequencyTarget : null
        updates.type = type
        updates.goal_mode = type === 'binary' ? null : goalMode
        updates.goal_value = type === 'binary' ? null : parseFloat(goalValue) || null
        updates.goal_unit = type === 'binary' ? null : goalUnit.trim()
      }

      const res = await fetch(`/api/habits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, createVersion }),
      })

      if (!res.ok) throw new Error('Failed to save')
      const result = await res.json()
      await refreshHabits()
      router.push(`/habit/${createVersion ? result.id : id}`)
    } catch (err) {
      alert('Failed to save habit')
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const steps: FormStep[] = ['basic', 'type', 'schedule', 'reminder']
  const stepIndex = steps.indexOf(step)
  const isFirstStep = step === 'basic'
  const isLastStep = step === 'reminder'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
        <Link href={`/habit/${id}`} className="text-sm font-semibold text-[#185FA5]">
          ← Cancel
        </Link>
        <h1 className="text-base font-bold text-gray-900">Edit Habit</h1>
        <div className="w-16" />
      </div>

      {/* Step progress */}
      <div className="flex gap-1 px-4 py-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${i <= stepIndex ? 'bg-[#185FA5]' : 'bg-gray-100'}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {step === 'basic' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Basic Information</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Habit Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#185FA5]"
              />
            </div>
            <IconPicker selectedIcon={icon} onIconSelect={setIcon} />
            <ColorPicker selectedColor={color} onColorSelect={setColor} />
          </div>
        )}

        {step === 'type' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Habit Type</h2>
            <div className="space-y-3 mb-5">
              {[
                { key: 'binary', label: 'Binary', description: 'Done / not done' },
                { key: 'quantitative', label: 'Quantitative', description: 'Track a value' },
              ].map(({ key, label, description }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key as any)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg border text-left transition-colors ${
                    type === key ? 'border-[#0C447C] bg-blue-50' : 'border-[#E5E5E5]'
                  }`}
                >
                  <div>
                    <p className={`text-sm font-semibold ${type === key ? 'text-[#0C447C]' : 'text-gray-900'}`}>
                      {label}
                    </p>
                    <p className={`text-xs mt-0.5 ${type === key ? 'text-[#0C447C]' : 'text-gray-500'}`}>
                      {description}
                    </p>
                  </div>
                  {type === key && <span className="text-[#0C447C] text-lg">●</span>}
                </button>
              ))}
            </div>

            {type === 'quantitative' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Tracking Mode</label>
                <div className="flex gap-2 mb-4">
                  {(['target', 'track'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setGoalMode(m)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        goalMode === m
                          ? 'border-[#185FA5] bg-[#185FA5] text-white'
                          : 'border-[#E5E5E5] text-gray-500'
                      }`}
                    >
                      {m === 'target' ? 'Target' : 'Track'}
                    </button>
                  ))}
                </div>
                {goalMode === 'target' && (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Goal Value</label>
                    <input
                      type="number"
                      value={goalValue}
                      onChange={(e) => setGoalValue(e.target.value)}
                      className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#185FA5]"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Unit</label>
                  <input
                    type="text"
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#185FA5]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'schedule' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Schedule</h2>
            <SchedulePicker
              scheduleType={scheduleType}
              scheduleDays={scheduleDays}
              frequencyTarget={frequencyTarget}
              onScheduleTypeChange={setScheduleType}
              onScheduleDaysChange={setScheduleDays}
              onFrequencyChange={setFrequencyTarget}
            />
          </div>
        )}

        {step === 'reminder' && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Reminder</h2>
            <div className="flex items-center justify-between py-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Enable Reminder</p>
                <p className="text-xs text-gray-500 mt-0.5">Get email reminders</p>
              </div>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  reminderEnabled ? 'bg-[#185FA5]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {reminderEnabled && (
              <p className="text-xs text-gray-400 mt-1">
                Reminder time is set globally in Settings → Reminders.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-4 py-4 border-t border-[#E5E5E5]">
        {!isFirstStep && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 border border-[#185FA5] rounded-lg text-sm font-semibold text-[#185FA5] hover:bg-blue-50 transition-colors"
          >
            Back
          </button>
        )}
        {!isLastStep ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3 bg-[#185FA5] rounded-lg text-sm font-semibold text-white hover:bg-[#0C447C] transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-3 bg-[#185FA5] rounded-lg text-sm font-semibold text-white hover:bg-[#0C447C] transition-colors disabled:opacity-60"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>
    </div>
  )
}
