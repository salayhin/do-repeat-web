'use client'

const ICONS = [
  // Health & Fitness
  '💧', '🏃‍♂️', '💪', '🏋️', '🧘‍♀️', '🚴', '🏊', '🥊', '🧗', '🤸',
  // Wellness & Mind
  '😴', '🧠', '❤️', '🌿', '🍵', '☕', '💆',
  // Productivity & Learning
  '📚', '📓', '✏️', '🎯', '💻', '📝', '🔬', '🎓', '⏰', '📖',
  // Food & Nutrition
  '🍎', '🥗', '🥑', '🥦', '🍳', '🥤',
  // Creative & Other
  '🎨', '🎵', '🌱', '☀️', '🌙', '⭐', '🌸',
]

interface IconPickerProps {
  selectedIcon: string
  onIconSelect: (icon: string) => void
}

export default function IconPicker({ selectedIcon, onIconSelect }: IconPickerProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">Icon <span className="font-normal text-gray-400">(optional)</span></label>
      <div className="flex flex-wrap gap-2">
        {/* None tile */}
        <button
          type="button"
          onClick={() => onIconSelect('')}
          className={`w-10 h-10 rounded-lg text-sm flex items-center justify-center border-2 transition-all focus:outline-none ${
            selectedIcon === ''
              ? 'border-[#185FA5] bg-blue-50 text-[#185FA5]'
              : 'border-dashed border-[#C5C5C5] text-gray-400 hover:border-gray-400'
          }`}
          aria-label="No icon"
        >
          —
        </button>
        {ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onIconSelect(icon)}
            className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-all focus:outline-none ${
              selectedIcon === icon
                ? 'border-[#185FA5] bg-blue-50 scale-110'
                : 'border-[#E5E5E5] hover:border-gray-300'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  )
}
