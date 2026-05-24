interface StreakBadgeProps {
  streak: number
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <span className="inline-flex items-center gap-0.5 text-sm font-bold text-[#0C447C]">
      🔥 {streak}
    </span>
  )
}
