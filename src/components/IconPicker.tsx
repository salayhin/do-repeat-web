'use client'

const ICONS = ['💧', '📚', '🧘‍♀️', '🏃‍♂️', '📓', '💪', '🎯', '🎨', '🎵', '🌱', '☀️', '🍎']

interface IconPickerProps {
  selectedIcon: string
  onIconSelect: (icon: string) => void
}

export default function IconPicker({ selectedIcon, onIconSelect }: IconPickerProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">Icon</label>
      <div className="flex flex-wrap gap-2">
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
