import { ImageResponse } from 'next/og'
import { getHabitByShareToken } from '@/src/db/queries/habits'
import { getCompletionsByHabit } from '@/src/db/queries/completions'
import { getSkipsByHabit } from '@/src/db/queries/skips'
import * as streakLib from '@/src/lib/streaks'
import * as reportSelectors from '@/src/lib/reportSelectors'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ token: string }>
}

export default async function Image({ params }: Props) {
  const { token } = await params
  const habit = await getHabitByShareToken(token)

  if (!habit) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          fontSize: 48,
          fontWeight: 'bold',
          color: '#185FA5',
        }}
      >
        Do Repeat
      </div>,
      { ...size }
    )
  }

  const completions = await getCompletionsByHabit(habit.user_id, habit.id)
  const skips = await getSkipsByHabit(habit.user_id, habit.id)
  const currentStreak = streakLib.computeCurrentStreak(habit, completions, skips)
  const bestStreak = streakLib.computeBestStreak(habit, completions, skips)
  const heatmapData = reportSelectors.getHeatmapData(habit, completions, skips, 12)

  // Group heatmap into weeks
  const weeks: typeof heatmapData[] = []
  for (let i = 0; i < 12; i++) {
    weeks.push(heatmapData.filter((c) => c.week === i))
  }

  function cellColor(status: string): string {
    switch (status) {
      case 'completed': return '#2E7D32'
      case 'skipped': return '#F9A825'
      case 'missed': return '#EF9A9A'
      default: return '#F0F0F0'
    }
  }

  const CELL = 28
  const GAP = 4

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        padding: 60,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: habit.color || '#185FA5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
          }}
        >
          {habit.icon || '⭐'}
        </div>
        <div>
          <div style={{ fontSize: 40, fontWeight: 'bold', color: '#000' }}>{habit.name}</div>
          <div style={{ fontSize: 20, color: '#666', marginTop: 4 }}>Habit Streak</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 40 }}>
        <div
          style={{
            padding: '20px 32px',
            background: '#F9F9F9',
            borderRadius: 16,
            border: '1px solid #E5E5E5',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 'bold', color: '#0C447C' }}>{currentStreak}</div>
          <div style={{ fontSize: 16, color: '#666', marginTop: 4 }}>Current Streak 🔥</div>
        </div>
        <div
          style={{
            padding: '20px 32px',
            background: '#F9F9F9',
            borderRadius: 16,
            border: '1px solid #E5E5E5',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 'bold', color: '#0C447C' }}>{bestStreak}</div>
          <div style={{ fontSize: 16, color: '#666', marginTop: 4 }}>Best Streak 🏆</div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ display: 'flex', gap: GAP }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
            {Array.from({ length: 7 }, (_, di) => {
              const cell = week.find((c) => c.dayOfWeek === di)
              return (
                <div
                  key={di}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 4,
                    background: cell ? cellColor(cell.status) : 'transparent',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', fontSize: 18, color: '#999' }}>
        Do Repeat – Build habits that stick
      </div>
    </div>,
    { ...size }
  )
}
