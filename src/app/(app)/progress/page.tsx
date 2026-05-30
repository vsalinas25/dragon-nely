import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { subDays } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { TZ } from '@/lib/utils'
import ProgressClient from './ProgressClient'

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ninetyDaysAgo = formatInTimeZone(subDays(new Date(), 90), TZ, 'yyyy-MM-dd')

  const [
    { data: profile },
    { data: weightLogs },
    { data: measurements },
    { data: badges },
    { data: checkins },
    { data: streak },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('weight_logs').select('*').eq('user_id', user.id).gte('logged_at', ninetyDaysAgo + 'T00:00:00').order('logged_at'),
    supabase.from('measurements').select('*').eq('user_id', user.id).order('logged_at'),
    supabase.from('badges').select('*').eq('user_id', user.id),
    supabase.from('daily_checkins').select('date').eq('user_id', user.id),
    supabase.from('streaks').select('*').eq('user_id', user.id).single(),
  ])

  return (
    <ProgressClient
      userId={user.id}
      profile={profile!}
      weightLogs={weightLogs ?? []}
      measurements={measurements ?? []}
      badges={(badges ?? []).map((b) => b.badge_type as import('@/types').BadgeType)}
      checkinDates={(checkins ?? []).map((c) => c.date)}
      streak={streak ?? { id: '', user_id: user.id, current_streak: 0, longest_streak: 0, last_checkin_date: null }}
    />
  )
}
