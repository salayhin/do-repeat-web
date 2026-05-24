'use client'
import { SignOutButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useUIStore } from '@/src/stores/uiStore'
import { getLocalDate } from '@/src/lib/dateUtils'

const TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris / Berlin (CET)', value: 'Europe/Paris' },
  { label: 'Moscow (MSK)', value: 'Europe/Moscow' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Karachi (PKT)', value: 'Asia/Karachi' },
  { label: 'Dhaka (BST)', value: 'Asia/Dhaka' },
  { label: 'Kolkata (IST)', value: 'Asia/Kolkata' },
  { label: 'Bangkok (ICT)', value: 'Asia/Bangkok' },
  { label: 'Singapore / KL (SGT)', value: 'Asia/Singapore' },
  { label: 'Tokyo / Seoul (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney' },
  { label: 'New York (ET)', value: 'America/New_York' },
  { label: 'Chicago (CT)', value: 'America/Chicago' },
  { label: 'Denver (MT)', value: 'America/Denver' },
  { label: 'Los Angeles (PT)', value: 'America/Los_Angeles' },
  { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo' },
]

export default function SettingsPage() {
  const { setTimezone: setStoreTimezone, setSelectedDate } = useUIStore()
  const [timezone, setTimezone] = useState('UTC')
  const [reminderTime, setReminderTime] = useState('08:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.timezone) setTimezone(d.timezone)
        if (d.reminderTime) setReminderTime(d.reminderTime)
      })
      .catch(() => {})
  }, [])

  const saveSettings = async (patch: Record<string, string>) => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Failed to save settings')
    } finally {
      setSaving(false)
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
    } catch {
      alert('Export failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-3 border-b border-[#E5E5E5]">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Reminders */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Reminders
          </h2>
          <div className="p-3 rounded-lg border border-[#E5E5E5] space-y-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900">Daily reminder settings</p>
              {saved && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
            </div>

            {/* Reminder time */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Reminder time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                onBlur={() => saveSettings({ reminderTime })}
                disabled={saving}
                className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#185FA5] disabled:opacity-60"
              />
              <p className="text-xs text-gray-400 mt-1">Applies to all habits with reminders enabled</p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => {
                  const tz = e.target.value
                  setTimezone(tz)
                  setStoreTimezone(tz)
                  setSelectedDate(getLocalDate(tz))
                  saveSettings({ timezone: tz })
                }}
                disabled={saving}
                className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#185FA5] bg-white disabled:opacity-60"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
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

        {/* About */}
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
