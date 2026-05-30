'use client'

import ActivityRing from '@/components/shared/ActivityRing'
import { cn } from '@/lib/utils'

interface Props {
  streak: number
  longestStreak: number
  animate?: boolean
}

export default function StreakIndicator({ streak, longestStreak, animate }: Props) {
  const target = Math.max(longestStreak, 30)
  const progress = Math.min(100, (streak / target) * 100)

  return (
    <div className={cn('ios-card p-5 flex items-center gap-5', animate && 'animate-bounce-in')}>
      {/* Ring */}
      <ActivityRing
        progress={progress}
        color="#E0A800"
        trackColor="rgba(224,168,0,0.15)"
        size={88}
        strokeWidth={10}
      >
        <span className="text-2xl">🔥</span>
      </ActivityRing>

      {/* Stats */}
      <div className="flex-1">
        <p className="ios-section-label mb-1">Sequência atual</p>
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn('text-5xl font-black tabular-nums leading-none', animate && 'animate-streak-pulse')}
            style={{ color: '#E0A800' }}
          >
            {streak}
          </span>
          <span className="text-lg font-semibold" style={{ color: '#1D9E75' }}>
            {streak === 1 ? 'dia' : 'dias'}
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: '#1D9E75' }}>
          Recorde:{' '}
          <span className="font-semibold" style={{ color: '#E0A800' }}>
            {longestStreak} dias
          </span>
        </p>
      </div>
    </div>
  )
}
