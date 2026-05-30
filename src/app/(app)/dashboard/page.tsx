import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
import { todayInBrazil } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { startOfWeek } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { TZ } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayInBrazil()

  const [
    profileRes, streakRes, pointsRes,
    todayCheckinRes, weekCheckinsRes,
    assessmentRes, latestWeightRes,
    allUsersRes, allStreaksRes, allPointsRes, allWeightsRes,
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('streaks').select('*').eq('user_id', user.id).single(),
    supabase.from('points').select('*').eq('user_id', user.id).single(),
    supabase.from('daily_checkins').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('daily_checkins').select('points_earned,date').eq('user_id', user.id)
      .gte('date', formatInTimeZone(startOfWeek(new Date(), { weekStartsOn: 1 }), TZ, 'yyyy-MM-dd')),
    supabase.from('assessments').select('current_weight_kg,desired_weight_kg').eq('user_id', user.id).single(),
    supabase.from('weight_logs').select('weight_kg').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('users').select('*'),
    supabase.from('streaks').select('*'),
    supabase.from('points').select('*'),
    supabase.from('weight_logs').select('user_id,weight_kg,logged_at').order('logged_at'),
  ])

  const profile    = profileRes.data
  const streak     = streakRes.data  ?? { current_streak: 0, longest_streak: 0, last_checkin_date: null }
  const points     = pointsRes.data  ?? { total_points: 0, monthly_points: 0 }
  const todayCheckin  = todayCheckinRes.data
  const weekCheckins  = weekCheckinsRes.data ?? []
  const assessment    = assessmentRes.data
  const latestWeight  = latestWeightRes.data?.weight_kg ?? null

  const weekPoints  = weekCheckins.reduce((s, c) => s + c.points_earned, 0)
  const todayPoints = todayCheckin?.points_earned ?? 0

  // Build leaderboard entries
  const leaderboard: LeaderboardEntry[] = (allUsersRes.data ?? []).map((u) => {
    const s = (allStreaksRes.data ?? []).find((x) => x.user_id === u.id)
      ?? { id: '', user_id: u.id, current_streak: 0, longest_streak: 0, last_checkin_date: null }
    const p = (allPointsRes.data ?? []).find((x) => x.user_id === u.id)
      ?? { id: '', user_id: u.id, total_points: 0, monthly_points: 0, last_reset_at: '' }
    const userWeights = (allWeightsRes.data ?? []).filter((w) => w.user_id === u.id)
    let weightChangePct: number | null = null
    if (userWeights.length >= 2) {
      const start = userWeights[0].weight_kg
      const latest = userWeights[userWeights.length - 1].weight_kg
      weightChangePct = ((latest - start) / start) * 100
    }
    return { user: u, streak: s, points: p, weightChangePct }
  })

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: profile?.name ?? 'Usuário',
        avatar_url: profile?.avatar_url ?? null,
        is_admin: profile?.is_admin ?? false,
        created_at: profile?.created_at ?? user.created_at ?? new Date().toISOString(),
        onboarding_completed: profile?.onboarding_completed ?? true,
      }}
      streak={streak}
      totalPoints={points.total_points}
      monthlyPoints={points.monthly_points}
      weekPoints={weekPoints}
      todayPoints={todayPoints}
      alreadyCheckedIn={!!todayCheckin}
      startWeight={assessment?.current_weight_kg ?? null}
      desiredWeight={assessment?.desired_weight_kg ?? null}
      currentWeight={latestWeight}
      leaderboard={leaderboard}
    />
  )
}
