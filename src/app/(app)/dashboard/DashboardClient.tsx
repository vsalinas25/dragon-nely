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
import type { User, Streak, LeaderboardEntry, WeeklyChallenge } from '@/types'

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
  activeChallenges: WeeklyChallenge[]
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
  activeChallenges,
}: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [checkedIn, setCheckedIn]             = useState(initialCheckedIn)
  const [streak, setStreak]                   = useState(initialStreak.current_streak)
  const [streakAnimating, setStreakAnimating] = useState(false)
  const [todayPoints, setTodayPoints]         = useState(initialTodayPoints)
  const [showConfetti, setShowConfetti]       = useState(false)
  const [avatarUrl, setAvatarUrl]             = useState<string | null>(user.avatar_url)
  const [greeting, setGreeting]               = useState(`Olá, ${user.name.split(' ')[0]}!`)
  const [dateStr, setDateStr]                 = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    setGreeting(greetingText(user.name.split(' ')[0]))
    setDateStr(formatDateBR(new Date()))
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

  const today = new Date()
  const displayUser = { ...user, avatar_url: avatarUrl }

  return (
    <div className="pb-8 space-y-4">
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
          colors={['#2ECC8A', '#FFE566', '#F0FFF8', '#E0A800', '#1D9E75']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}

      {/* Top bar — logo + settings */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: '0.5px solid rgba(29,158,117,0.15)' }}
      >
        <DragonLogoHeader />
        {user.is_admin && (
          <Link
            href="/admin"
            className="p-2.5 rounded-xl transition-colors"
            style={{ background: 'rgba(29,158,117,0.08)' }}
          >
            <Settings className="w-5 h-5" style={{ color: '#1D9E75' }} />
          </Link>
        )}
      </div>

      {/* User greeting row */}
      <div className="flex items-center gap-4 px-4">
        <Avatar
          user={{ ...displayUser, id: user.id }}
          size="xl"
          editable
          onUpload={(url) => setAvatarUrl(url)}
        />
        <div className="flex-1 min-w-0">
          <h1
            className="font-bold leading-tight"
            style={{ fontSize: 22, color: '#0D3B2E' }}
          >
            {greeting}
          </h1>
          <p className="mt-0.5 font-medium" style={{ fontSize: 14, color: '#1D9E75' }}>
            {dateStr}
          </p>
          <div className="mt-1.5">
            <PhaseIndicator createdAt={user.created_at} />
          </div>
        </div>
      </div>

      {/* Content cards */}
      <div className="px-4 space-y-4">
        <StreakIndicator streak={streak} longestStreak={initialStreak.longest_streak} animate={streakAnimating} />
        <CheckInCard alreadyCheckedIn={checkedIn} onSuccess={handleCheckinSuccess} />
        {activeChallenges.length > 0 && <ChallengesWidget challenges={activeChallenges} today={todayInBrazil()} />}
        <QuickRanking entries={leaderboard} currentUserId={user.id} />
        <PointsSummary
          todayPoints={todayPoints}
          weekPoints={weekPoints}
          monthPoints={monthlyPoints}
          totalPoints={totalPoints}
        />
        {startWeight && desiredWeight && currentWeight && (
          <WeightGoalCard start={startWeight} desired={desiredWeight} current={currentWeight} />
        )}
      </div>
    </div>
  )
}

function ChallengesWidget({ challenges, today }: { challenges: WeeklyChallenge[], today: string }) {
  return (
    <div className="ios-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="ios-section-label mb-0">Desafios</p>
        <Link href="/challenges" className="text-sm font-semibold" style={{ color: '#1D9E75' }}>
          Ver todos →
        </Link>
      </div>
      {challenges.map((ch) => {
        const isActive = ch.start_date <= today && ch.end_date >= today
        return (
          <div
            key={ch.id}
            className="flex items-center gap-3 p-3 rounded-2xl"
            style={{
              background: isActive ? 'rgba(29,158,117,0.08)' : 'rgba(224,168,0,0.06)',
              border: isActive ? '1px solid rgba(29,158,117,0.2)' : '1px solid rgba(224,168,0,0.2)',
            }}
          >
            <span style={{ fontSize: 28 }}>{isActive ? '🏁' : '⏳'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight" style={{ fontSize: 15, color: '#0D3B2E' }}>{ch.title}</p>
              <p className="mt-0.5" style={{ fontSize: 12, color: '#1D9E75' }}>{ch.description}</p>
            </div>
            <span
              className="font-black flex-shrink-0"
              style={{ fontSize: 13, color: isActive ? '#1D9E75' : '#A87200' }}
            >
              +{ch.reward_points} pts
            </span>
          </div>
        )
      })}
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
        <span className="text-sm font-bold" style={{ color: '#1D9E75' }}>{pct.toFixed(0)}% concluído</span>
      </div>
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 15, color: '#1D9E75' }}>{start} kg</span>
        <span className="font-black" style={{ fontSize: 22, color: '#0D3B2E' }}>{current} kg</span>
        <span className="font-semibold" style={{ fontSize: 15, color: '#1D9E75' }}>{desired} kg 🎯</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-center" style={{ fontSize: 13, color: '#1D9E75' }}>
        {lost > 0
          ? `${lost.toFixed(1)} kg perdidos · faltam ${Math.max(0, current - desired).toFixed(1)} kg`
          : `Meta: perder ${totalToLose.toFixed(1)} kg`}
      </p>
    </div>
  )
}
