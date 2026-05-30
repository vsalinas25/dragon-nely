import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateCheckinPoints } from '@/lib/gamification/points'
import { computeNewStreak } from '@/lib/gamification/streaks'
import { computeNewBadges } from '@/lib/gamification/badges'
import { todayInBrazil } from '@/lib/utils'
import type { BadgeType, CheckinForm } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: CheckinForm = await req.json()
  const today = todayInBrazil()
  const points = calculateCheckinPoints(body)

  // 1. Upsert check-in
  const { error: checkinError } = await supabase
    .from('daily_checkins')
    .upsert({
      user_id: user.id,
      date: today,
      ...body,
      points_earned: points,
    }, { onConflict: 'user_id,date' })

  if (checkinError) {
    return NextResponse.json({ error: checkinError.message }, { status: 400 })
  }

  // 2. Fetch current streak
  const { data: streakData } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const newStreak = computeNewStreak(
    streakData?.last_checkin_date ?? null,
    streakData?.current_streak ?? 0,
    streakData?.longest_streak ?? 0
  )

  await supabase
    .from('streaks')
    .upsert({ user_id: user.id, ...newStreak }, { onConflict: 'user_id' })

  // 3. Update points
  const { data: pointsData } = await supabase
    .from('points')
    .select('*')
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('points')
    .upsert({
      user_id: user.id,
      total_points: (pointsData?.total_points ?? 0) + points,
      monthly_points: (pointsData?.monthly_points ?? 0) + points,
    }, { onConflict: 'user_id' })

  // 4. Check and award badges
  const { data: allCheckins } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)

  const { data: weightLogs } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })

  const { data: existingBadges } = await supabase
    .from('badges')
    .select('badge_type')
    .eq('user_id', user.id)

  const newBadges = computeNewBadges({
    existingBadges: (existingBadges ?? []).map((b) => b.badge_type as BadgeType),
    streak: { ...newStreak, id: streakData?.id ?? '', user_id: user.id },
    checkins: allCheckins ?? [],
    weightLogs: weightLogs ?? [],
  })

  if (newBadges.length > 0) {
    await supabase.from('badges').insert(
      newBadges.map((badge_type) => ({ user_id: user.id, badge_type }))
    )
  }

  // 5. Write to activity feed
  const { data: userData } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  await supabase.from('activity_feed').insert({
    user_id: user.id,
    event_type: 'checkin',
    message: `${userData?.name ?? 'Alguém'} fez o check-in do dia 🔥`,
    metadata: { points, streak: newStreak.current_streak },
  })

  for (const badge of newBadges) {
    const label = badgeLabel(badge)
    await supabase.from('activity_feed').insert({
      user_id: user.id,
      event_type: 'badge',
      message: `${userData?.name ?? 'Alguém'} conquistou o badge: ${label} 🏅`,
      metadata: { badge_type: badge },
    })
  }

  return NextResponse.json({
    success: true,
    points,
    streak: newStreak,
    newBadges,
  })
}

function badgeLabel(badge: BadgeType): string {
  const labels: Record<BadgeType, string> = {
    first_step: 'Primeiro Passo',
    week_warrior: 'Guerreiro Semanal',
    sugar_crusher: 'Esmaga-Açúcar',
    iron_will: 'Vontade de Ferro',
    transformation: 'Transformação',
    hydration_hero: 'Herói da Hidratação',
    exercise_enthusiast: 'Entusiasta do Exercício',
  }
  return labels[badge] ?? badge
}
