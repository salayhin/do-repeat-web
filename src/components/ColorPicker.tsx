'use client'
import { HexColorPicker } from 'react-colorful'
import { useState, useEffect } from 'react'

const PRESET_COLORS = [
  '#1D9E75', '#D85A30', '#3B6D11', '#854F0B',
  '#993556', '#185FA5', '#7B2D8B', '#C17D11',
]

interface ColorPickerProps {
  selectedColor: string
  onColorSelect: (color: string) => void
}

export default function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(selectedColor)

  useEffect(() => { setHexInput(selectedColor) }, [selectedColor])

  const handleWheelChange = (color: string) => {
    setHexInput(color)
    onColorSelect(color)
  }

  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onColorSelect(val)
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-900 mb-2">Color</label>
      <HexColorPicker color={selectedColor} onChange={handleWheelChange} style={{ width: '100%', height: 160 }} />
      <input
        type="text"
        value={hexInput}
        onChange={handleHexInput}
        maxLength={7}
        placeholder="#1D9E75"
        className="mt-2 w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#185FA5]"
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => { setHexInput(color); onColorSelect(color) }}
            className="w-8 h-8 rounded-full border-2 transition-all focus:outline-none"
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
