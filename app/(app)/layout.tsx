'use client'
import Link from 'next/link'
import { SignOutButton, useUser } from '@clerk/nextjs'
import { useState } from 'react'
import { HabitsInitializer } from '@/src/components/HabitsInitializer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HabitsInitializer />
      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-[#E5E5E5] flex items-center justify-between px-4 h-12">
        <Link href="/check-in" className="flex items-center gap-2">
          <img src="/do-repeat-logo.svg" alt="Do Repeat" className="w-6 h-6" />
          <span className="text-base font-bold text-gray-900">do repeat</span>
        </Link>
        <MobileUserMenu />
      </header>

      <main className="flex-1 pb-16 pt-12 md:pt-0 md:pb-0 md:pl-56">{children}</main>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col border-r border-[#E5E5E5] bg-white px-4 py-6 gap-1">
        <Link href="/check-in" className="flex items-center gap-2 mb-8 px-2 hover:opacity-80 transition-opacity">
          <img src="/do-repeat-logo.svg" alt="Do Repeat" className="w-8 h-8" />
          <span className="text-lg font-bold text-gray-900">do repeat</span>
        </Link>
        <NavLink href="/check-in" label="Check In" icon="✓" />
        <NavLink href="/habits" label="My Habits" icon="📋" />
        <NavLink href="/reports" label="Reports" icon="📊" />
        <div className="mt-auto">
          <UserMenu />
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] flex">
        <MobileTab href="/check-in" label="Check In" icon="✓" />
        <MobileTab href="/habits" label="My Habits" icon="📋" />
        <MobileTab href="/reports" label="Reports" icon="📊" />
      </nav>
    </div>
  )
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#185FA5] transition-colors"
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  )
}

function MobileTab({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-gray-600 hover:text-[#185FA5] transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

function MobileUserMenu() {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const name = user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Account'
  const initials = name.slice(0, 2).toUpperCase()
  const avatarUrl = user?.imageUrl

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="focus:outline-none">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-1 w-48 overflow-hidden">
            <p className="px-3 py-2 text-xs text-gray-400 truncate">{user?.emailAddresses[0]?.emailAddress}</p>
            <div className="border-t border-[#E5E5E5] my-1" />
            <Link href="/settings" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <span>⚙️</span> Settings
            </Link>
            <div className="border-t border-[#E5E5E5] my-1" />
            <SignOutButton>
              <button type="button"
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <span>→</span> Sign out
              </button>
            </SignOutButton>
          </div>
        </>
      )}
    </div>
  )
}

function UserMenu() {
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  const name = user?.fullName || user?.firstName || user?.emailAddresses[0]?.emailAddress || 'Account'
  const email = user?.emailAddresses[0]?.emailAddress || ''
  const initials = name.slice(0, 2).toUpperCase()
  const avatarUrl = user?.imageUrl

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-400 truncate">{email}</p>
        </div>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-1 z-20 bg-white border border-[#E5E5E5] rounded-xl shadow-lg py-1 overflow-hidden">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>⚙️</span> Settings
            </Link>
            <div className="border-t border-[#E5E5E5] my-1" />
            <SignOutButton>
              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <span>→</span> Sign out
              </button>
            </SignOutButton>
          </div>
        </>
      )}
    </div>
  )
}
