'use client'

import Link from 'next/link'
import { ChevronRight, Flame } from 'lucide-react'
import ActivityRing from '@/components/shared/ActivityRing'
import Avatar from '@/components/shared/Avatar'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'

interface Props {
  entries: LeaderboardEntry[]
  currentUserId: string
}

export default function QuickRanking({ entries, currentUserId }: Props) {
  if (entries.length === 0) return null

  const sorted = [...entries].sort((a, b) => {
    const d = b.points.monthly_points - a.points.monthly_points
    return d !== 0 ? d : b.streak.current_streak - a.streak.current_streak
  })

  const [first, second, third, ...rest] = sorted
  const me = sorted.find((e) => e.user.id === currentUserId)
  const myRank = me ? sorted.indexOf(me) + 1 : null
  const above = myRank && myRank > 1 ? sorted[myRank - 2] : null
  const gap = above && me ? above.points.monthly_points - me.points.monthly_points : null

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '0.5px solid rgba(29,158,117,0.25)',
        boxShadow: '0 2px 12px rgba(13,59,46,0.06)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <p className="ios-section-label mb-0.5">Ranking do Mês</p>
          <p className="font-bold text-[17px]" style={{ color: '#0D3B2E' }}>Quem está na frente? 🏆</p>
        </div>
        <Link
          href="/rankings"
          className="flex items-center gap-0.5 text-sm font-semibold"
          style={{ color: '#2ECC8A' }}
        >
          Ver todos <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 px-4 pb-4 pt-2">
        {second && <PodiumSlot entry={second} rank={2} isMe={second.user.id === currentUserId} />}
        {first  && <PodiumSlot entry={first}  rank={1} isMe={first.user.id  === currentUserId} />}
        {third  && <PodiumSlot entry={third}  rank={3} isMe={third.user.id  === currentUserId} />}
      </div>

      {/* Compact rest */}
      {rest.length > 0 && (
        <div style={{ borderTop: '0.5px solid rgba(29,158,117,0.25)' }}>
          {rest.map((entry, i) => {
            const rank = i + 4
            const isMe = entry.user.id === currentUserId
            return (
              <div
                key={entry.user.id}
                className="flex items-center gap-3 px-4 py-2.5"
                style={{
                  background: isMe ? 'rgba(46,204,138,0.06)' : 'transparent',
                  borderBottom: i < rest.length - 1 ? '0.5px solid rgba(29,158,117,0.15)' : 'none',
                }}
              >
                <span className="text-xs font-bold w-4 text-center" style={{ color: '#1D9E75' }}>{rank}</span>
                <Avatar user={entry.user} size="sm" />
                <p className="flex-1 text-sm font-semibold" style={{ color: isMe ? '#2ECC8A' : '#F0FFF8' }}>
                  {entry.user.name}
                  {isMe && <span className="text-xs font-medium ml-1" style={{ color: 'rgba(46,204,138,0.7)' }}>você</span>}
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#1D9E75' }}>
                  <span className="font-semibold" style={{ color: '#E0A800' }}>🔥{entry.streak.current_streak}</span>
                  <span className="font-bold" style={{ color: '#0D3B2E' }}>{entry.points.monthly_points} pts</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Motivation message */}
      {gap !== null && gap > 0 && me && above && (
        <div
          className="mx-4 mb-4 mt-2 rounded-2xl px-4 py-3 flex items-center gap-2"
          style={{ background: 'rgba(29,158,117,0.12)', border: '0.5px solid rgba(29,158,117,0.3)' }}
        >
          <span className="text-lg">⚡</span>
          <p className="text-sm font-semibold leading-snug" style={{ color: '#2ECC8A' }}>
            Você está <span className="font-black">{gap} pts</span> atrás de {above.user.name.split(' ')[0]}. Faça o check-in hoje!
          </p>
        </div>
      )}

      {myRank === 1 && (
        <div
          className="mx-4 mb-4 mt-2 rounded-2xl px-4 py-3 flex items-center gap-2"
          style={{ background: 'rgba(224,168,0,0.12)', border: '0.5px solid rgba(224,168,0,0.3)' }}
        >
          <span className="text-lg animate-crown-float">👑</span>
          <p className="text-sm font-semibold" style={{ color: '#A87200' }}>
            Você está liderando! Continue assim para manter o topo.
          </p>
        </div>
      )}
    </div>
  )
}

function PodiumSlot({ entry, rank, isMe }: {
  entry: LeaderboardEntry
  rank: 1 | 2 | 3
  isMe: boolean
}) {
  const isWinner = rank === 1
  const heights = { 1: 'h-16', 2: 'h-10', 3: 'h-8' }
  const ringColors = { 1: '#E0A800', 2: '#A8A8A8', 3: '#CD7F32' }
  const ringSize = isWinner ? 72 : 56
  const strokeWidth = isWinner ? 7 : 5

  return (
    <div className={cn('flex flex-col items-center gap-1.5', isWinner ? 'mb-0' : 'mb-0 mt-auto')}>
      {isWinner && (
        <span className="text-2xl animate-crown-float leading-none">👑</span>
      )}

      <div className={cn('rounded-full transition-all', isWinner && 'animate-winner-glow')}>
        <ActivityRing
          progress={Math.min(100, (entry.streak.current_streak / 30) * 100)}
          color={ringColors[rank]}
          trackColor="rgba(29,158,117,0.12)"
          size={ringSize}
          strokeWidth={strokeWidth}
        >
          <Avatar
            user={entry.user}
            size={isWinner ? 'md' : 'sm'}
            className={cn(isMe && 'ring-2 ring-[#2ECC8A]')}
          />
        </ActivityRing>
      </div>

      <p
        className={cn('text-center font-bold leading-tight max-w-[72px] truncate', isWinner ? 'text-[13px]' : 'text-[11px]')}
        style={{ color: isMe ? '#1D9E75' : '#0D3B2E' }}
      >
        {entry.user.name.split(' ')[0]}
      </p>

      <p
        className={cn('font-black tabular-nums', isWinner ? 'text-[15px]' : 'text-[12px]')}
        style={{ color: isWinner ? '#A87200' : '#1D9E75' }}
      >
        {entry.points.monthly_points}
      </p>

      <div className="flex items-center gap-0.5">
        <Flame
          className={cn('fill-current', isWinner ? 'w-3.5 h-3.5' : 'w-3 h-3')}
          style={{ color: '#E0A800' }}
        />
        <span
          className={cn('font-semibold', isWinner ? 'text-[12px]' : 'text-[10px]')}
          style={{ color: '#E0A800' }}
        >
          {entry.streak.current_streak}d
        </span>
      </div>

      {/* Podium block */}
      <div
        className={cn(
          'w-full rounded-t-xl flex items-center justify-center font-black min-w-[68px]',
          heights[rank],
          isWinner ? 'text-lg' : 'text-sm'
        )}
        style={
          isWinner
            ? { background: 'linear-gradient(180deg, #FFE566 0%, #E0A800 100%)', color: '#0D3B2E' }
            : { background: 'rgba(255,255,255,0.08)', color: '#A8F0D0' }
        }
      >
        {rank === 1 ? '1°' : rank === 2 ? '2°' : '3°'}
      </div>
    </div>
  )
}
