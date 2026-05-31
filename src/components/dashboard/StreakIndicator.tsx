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
      <ActivityRing
        progress={progress}
        color="#E0A800"
        trackColor="rgba(224,168,0,0.15)"
        size={96}
        strokeWidth={10}
      >
        <span style={{ fontSize: 28 }}>🔥</span>
      </ActivityRing>

      <div className="flex-1">
        <p className="ios-section-label mb-1">Sequência atual</p>
        <div className="flex items-baseline gap-2">
          <span
            className={cn('font-black tabular-nums leading-none', animate && 'animate-streak-pulse')}
            style={{ fontSize: 56, color: '#E0A800' }}
          >
            {streak}
          </span>
          <span className="font-semibold" style={{ fontSize: 20, color: '#1D9E75' }}>
            {streak === 1 ? 'dia' : 'dias'}
          </span>
        </div>
        <p className="mt-1" style={{ fontSize: 14, color: '#1D9E75' }}>
          Recorde:{' '}
          <span className="font-bold" style={{ color: '#E0A800' }}>
            {longestStreak} dias
          </span>
        </p>
      </div>
    </div>
  )
}
