'use client'

const COLORS = [
  '#1D9E75',
  '#D85A30',
  '#3B6D11',
  '#854F0B',
  '#993556',
  '#185FA5',
  '#7B2D8B',
  '#C17D11',
]

interface ColorPickerProps {
  selectedColor: string
  onColorSelect: (color: string) => void
}

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">Color</label>
      <div className="flex flex-wrap gap-3">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className="w-9 h-9 rounded-full border-2 transition-all focus:outline-none"
            style={{
              backgroundColor: color,
              borderColor: selectedColor === color ? '#000' : 'transparent',
              transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)',
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  )
}
