import Link from 'next/link'
import { SignOutButton } from '@clerk/nextjs'
import { HabitsInitializer } from '@/src/components/HabitsInitializer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <HabitsInitializer />
      <main className="flex-1 pb-16 md:pb-0 md:pl-56">{children}</main>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col border-r border-[#E5E5E5] bg-white px-4 py-6 gap-1">
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="text-2xl">🔁</span>
          <span className="text-lg font-bold text-gray-900">Do Repeat</span>
        </div>
        <NavLink href="/today" label="Today" icon="✓" />
        <NavLink href="/reports" label="Reports" icon="📊" />
        <NavLink href="/settings" label="Settings" icon="⚙️" />
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/habit/create"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#185FA5] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0C447C] transition-colors"
          >
            + New Habit
          </Link>
          <SignOutButton>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] flex">
        <MobileTab href="/today" label="Today" icon="✓" />
        <MobileTab href="/reports" label="Reports" icon="📊" />
        <MobileTab href="/settings" label="Settings" icon="⚙️" />
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
