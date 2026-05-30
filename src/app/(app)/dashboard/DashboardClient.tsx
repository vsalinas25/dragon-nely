'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import StreakIndicator from '@/components/dashboard/StreakIndicator'
import CheckInCard from '@/components/dashboard/CheckInCard'
import PointsSummary from '@/components/dashboard/PointsSummary'
import QuickRanking from '@/components/dashboard/QuickRanking'
import PhaseIndicator from '@/components/shared/PhaseIndicator'
import Avatar from '@/components/shared/Avatar'
import DragonLogoHeader from '@/components/brand/DragonLogoHeader'
import { useToast } from '@/components/ui/use-toast'
import { greetingText, formatDateBR, todayInBrazil } from '@/lib/utils'
import { BADGE_DEFINITIONS } from '@/types'
import type { User, Streak, LeaderboardEntry } from '@/types'

const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

interface Props {
  user: User & { onboarding_completed?: boolean }
  streak: Pick<Streak, 'current_streak' | 'longest_streak' | 'last_checkin_date'>
  totalPoints: number
  monthlyPoints: number
  weekPoints: number
  todayPoints: number
  alreadyCheckedIn: boolean
  startWeight: number | null
  desiredWeight: number | null
  currentWeight: number | null
  leaderboard: LeaderboardEntry[]
}

export default function DashboardClient({
  user,
  streak: initialStreak,
  totalPoints,
  monthlyPoints,
  weekPoints,
  todayPoints: initialTodayPoints,
  alreadyCheckedIn: initialCheckedIn,
  startWeight,
  desiredWeight,
  currentWeight,
  leaderboard,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [checkedIn, setCheckedIn]             = useState(initialCheckedIn)
  const [streak, setStreak]                   = useState(initialStreak.current_streak)
  const [streakAnimating, setStreakAnimating] = useState(false)
  const [todayPoints, setTodayPoints]         = useState(initialTodayPoints)
  const [showConfetti, setShowConfetti]       = useState(false)
  const [avatarUrl, setAvatarUrl]             = useState<string | null>(user.avatar_url)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  function handleCheckinSuccess(pts: number, newStreak: number, newBadges: string[]) {
    setCheckedIn(true)
    setTodayPoints(pts)
    setStreak(newStreak)
    setStreakAnimating(true)
    setTimeout(() => setStreakAnimating(false), 1000)

    toast({ title: `+${pts} pontos! 🎉`, description: newStreak > 1 ? `Streak de ${newStreak} dias! 🔥` : 'Check-in feito!' })

    if (newBadges.length > 0) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
      newBadges.forEach((badge) => {
        const def = BADGE_DEFINITIONS.find((b) => b.type === badge)
        if (def) setTimeout(() => toast({ title: `Badge desbloqueado! ${def.icon}`, description: def.label }), 500)
      })
    }

    router.refresh()
  }

  const today = new Date(todayInBrazil() + 'T12:00:00')
  const displayUser = { ...user, avatar_url: avatarUrl }

  return (
    <div className="px-4 pt-2 pb-6 space-y-3">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
          colors={['#2ECC8A', '#FFE566', '#F0FFF8', '#E0A800', '#1D9E75']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pt-3 pb-1">
        <div className="flex items-center gap-3.5">
          <Avatar
            user={{ ...displayUser, id: user.id }}
            size="xl"
            editable
            onUpload={(url) => setAvatarUrl(url)}
          />
          <div>
            <h1 suppressHydrationWarning className="font-bold text-[17px] leading-tight" style={{ color: '#0D3B2E' }}>
              {greetingText(user.name.split(' ')[0])}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#1D9E75' }}>{formatDateBR(today)}</p>
            <div className="mt-1">
              <PhaseIndicator createdAt={user.created_at} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DragonLogoHeader />
          {user.is_admin && (
            <Link
              href="/admin"
              className="p-2 rounded-xl transition-colors flex-shrink-0"
              style={{ background: 'rgba(29,158,117,0.08)' }}
            >
              <Settings className="w-4 h-4" style={{ color: '#1D9E75' }} />
            </Link>
          )}
        </div>
      </div>

      {/* Streak */}
      <StreakIndicator streak={streak} longestStreak={initialStreak.longest_streak} animate={streakAnimating} />

      {/* Check-in */}
      <CheckInCard alreadyCheckedIn={checkedIn} onSuccess={handleCheckinSuccess} />

      {/* Quick Ranking */}
      <QuickRanking entries={leaderboard} currentUserId={user.id} />

      {/* Points */}
      <PointsSummary
        todayPoints={todayPoints}
        weekPoints={weekPoints}
        monthPoints={monthlyPoints}
        totalPoints={totalPoints}
      />

      {/* Weight goal */}
      {startWeight && desiredWeight && currentWeight && (
        <WeightGoalCard start={startWeight} desired={desiredWeight} current={currentWeight} />
      )}
    </div>
  )
}

function WeightGoalCard({ start, desired, current }: { start: number; desired: number; current: number }) {
  const totalToLose = start - desired
  const lost = start - current
  const pct = totalToLose > 0 ? Math.min(100, Math.max(0, (lost / totalToLose) * 100)) : 0

  return (
    <div className="ios-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="ios-section-label mb-0">Meta de peso</p>
        <span className="text-xs font-bold" style={{ color: '#2ECC8A' }}>{pct.toFixed(0)}% concluído</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: '#1D9E75' }}>{start} kg</span>
        <span className="font-black text-[17px]" style={{ color: '#0D3B2E' }}>{current} kg</span>
        <span className="font-semibold" style={{ color: '#2ECC8A' }}>{desired} kg 🎯</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-center" style={{ color: '#1D9E75' }}>
        {lost > 0
          ? `${lost.toFixed(1)} kg perdidos · faltam ${Math.max(0, current - desired).toFixed(1)} kg`
          : `Meta: perder ${totalToLose.toFixed(1)} kg`}
      </p>
    </div>
  )
}
