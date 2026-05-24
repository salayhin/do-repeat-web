'use client'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

interface SchedulePickerProps {
  scheduleType: 'daily' | 'weekly' | 'frequency'
  scheduleDays?: string[]
  frequencyTarget?: number
  onScheduleTypeChange: (type: 'daily' | 'weekly' | 'frequency') => void
  onScheduleDaysChange?: (days: string[]) => void
  onFrequencyChange?: (frequency: number) => void
}

export default function SchedulePicker({
  scheduleType,
  scheduleDays = [],
  frequencyTarget = 3,
  onScheduleTypeChange,
  onScheduleDaysChange,
  onFrequencyChange,
}: SchedulePickerProps) {
  const parsedScheduleDays = Array.isArray(scheduleDays) ? scheduleDays : []

  const handleDayToggle = (dayKey: string) => {
    if (!onScheduleDaysChange) return
    const updatedDays = parsedScheduleDays.includes(dayKey)
      ? parsedScheduleDays.filter((d) => d !== dayKey)
      : [...parsedScheduleDays, dayKey]
    onScheduleDaysChange(updatedDays)
  }

  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-900 mb-3">Schedule</label>

      <div className="flex gap-2 mb-4">
        {(['daily', 'weekly', 'frequency'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onScheduleTypeChange(type)}
            className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-colors ${
              scheduleType === type
                ? 'border-[#185FA5] bg-blue-50 text-[#0C447C]'
                : 'border-[#E5E5E5] text-gray-500 hover:border-gray-300'
            }`}
          >
            {type === 'daily' ? 'Daily' : type === 'weekly' ? 'Specific days' : 'Frequency'}
          </button>
        ))}
      </div>

      {scheduleType === 'weekly' && (
        <div className="flex gap-1.5 flex-wrap">
          {DAYS.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(DAY_KEYS[index])}
              className={`w-10 h-10 rounded-lg border text-xs font-semibold transition-colors ${
                parsedScheduleDays.includes(DAY_KEYS[index])
                  ? 'border-[#185FA5] bg-[#185FA5] text-white'
                  : 'border-[#E5E5E5] text-gray-500 hover:border-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {scheduleType === 'frequency' && (
        <div>
          <p className="text-sm text-gray-500 mb-2">Times per week</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onFrequencyChange?.(num)}
                className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  frequencyTarget === num
                    ? 'border-[#185FA5] bg-[#185FA5] text-white'
                    : 'border-[#E5E5E5] text-gray-500 hover:border-gray-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
