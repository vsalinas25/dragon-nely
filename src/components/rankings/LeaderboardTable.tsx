'use client'

import { useRealtimeLeaderboard } from '@/hooks/useRealtimeLeaderboard'
import Avatar from '@/components/shared/Avatar'
import ActivityRing from '@/components/shared/ActivityRing'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'

interface Props {
  initial: LeaderboardEntry[]
  mode: 'consistency' | 'evolution'
  currentUserId: string
}

export default function LeaderboardTable({ initial, mode, currentUserId }: Props) {
  const entries = useRealtimeLeaderboard(initial)

  const sorted = [...entries].sort((a, b) => {
    if (mode === 'consistency') {
      const d = b.streak.current_streak - a.streak.current_streak
      return d !== 0 ? d : b.points.monthly_points - a.points.monthly_points
    }
    return (a.weightChangePct ?? 0) - (b.weightChangePct ?? 0)
  })

  const MEDALS = ['🥇', '🥈', '🥉']
  const maxPoints = Math.max(...sorted.map((e) => e.points.total_points), 1)

  return (
    <div className="ios-card overflow-hidden">
      {sorted.map((entry, idx) => {
        const isMe = entry.user.id === currentUserId
        const pct = entry.weightChangePct
        const ringProgress = mode === 'consistency'
          ? Math.min(100, (entry.streak.current_streak / 30) * 100)
          : Math.max(0, Math.min(100, pct !== null ? Math.abs(pct) * 5 : 0))

        return (
          <div key={entry.user.id}>
            <div className={cn(
              'flex items-center gap-3 px-4 py-3.5',
              isMe && 'bg-[#30D158]/5'
            )}>
              {/* Rank */}
              <span className="text-lg w-6 text-center flex-shrink-0 leading-none">
                {idx < 3 ? MEDALS[idx] : <span className="text-sm font-bold text-[#8E8E93]">{idx + 1}</span>}
              </span>

              {/* Ring */}
              <ActivityRing
                progress={ringProgress}
                color={mode === 'consistency' ? '#FF9F0A' : '#30D158'}
                size={44}
                strokeWidth={5}
              >
                <Avatar user={entry.user} size="sm" />
              </ActivityRing>

              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <p className={cn('font-semibold text-[15px] text-[#1C1C1E] truncate', isMe && 'text-[#30D158]')}>
                  {entry.user.name}
                  {isMe && <span className="text-xs text-[#30D158]/70 ml-1.5 font-medium">você</span>}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {mode === 'consistency' ? (
                    <>
                      <span className="text-xs text-[#FF9F0A] font-semibold">
                        🔥 {entry.streak.current_streak}d
                      </span>
                      <span className="text-[10px] text-[#C7C7CC]">·</span>
                      <span className="text-xs text-[#8E8E93]">{entry.points.monthly_points} pts/mês</span>
                    </>
                  ) : pct === null ? (
                    <span className="text-xs text-[#8E8E93]">Sem dados de peso</span>
                  ) : pct < 0 ? (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-[#30D158]">
                      <TrendingDown className="w-3 h-3" />{Math.abs(pct).toFixed(1)}% perdido
                    </span>
                  ) : pct > 0 ? (
                    <span className="flex items-center gap-0.5 text-xs text-[#FF453A]">
                      <TrendingUp className="w-3 h-3" />+{pct.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-xs text-[#8E8E93]">
                      <Minus className="w-3 h-3" />Sem mudança
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <p className="text-[17px] font-black text-[#1C1C1E] tabular-nums">
                  {mode === 'consistency'
                    ? entry.points.total_points
                    : pct !== null ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : '–'}
                </p>
                <p className="text-[10px] text-[#8E8E93]">
                  {mode === 'consistency' ? 'pts' : 'variação'}
                </p>
              </div>
            </div>

            {/* Divider (skip last) */}
            {idx < sorted.length - 1 && (
              <div className="h-px bg-[#E5E5EA] ml-[72px]" />
            )}
          </div>
        )
      })}
    </div>
  )
}
