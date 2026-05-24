'use client'
import { UserButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const res = await fetch(`/api/export?format=${format}`)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `do-repeat-export.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-3 border-b border-[#E5E5E5]">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Account */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Account
          </h2>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E5E5]">
            <UserButton />
            <div>
              <p className="text-sm font-semibold text-gray-900">Profile</p>
              <p className="text-xs text-gray-500">Manage your account</p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Appearance
          </h2>
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#E5E5E5]">
            <div>
              <p className="text-sm font-semibold text-gray-900">Dark Mode</p>
              <p className="text-xs text-gray-500">Toggle light/dark theme</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
                isDark ? 'bg-[#185FA5]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isDark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data Export */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Data Export
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E5E5] hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Download CSV</p>
                <p className="text-xs text-gray-500">Export all completions as spreadsheet</p>
              </div>
              <span className="text-gray-400 text-sm">↓</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-[#E5E5E5] hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Download JSON</p>
                <p className="text-xs text-gray-500">Export full data dump</p>
              </div>
              <span className="text-gray-400 text-sm">↓</span>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            About
          </h2>
          <div className="p-3 rounded-lg border border-[#E5E5E5]">
            <p className="text-sm font-semibold text-gray-900">Do Repeat</p>
            <p className="text-xs text-gray-500 mt-0.5">Habit tracker web app</p>
          </div>
        </div>
      </div>
    </div>
  )
}
