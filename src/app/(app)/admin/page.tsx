import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const [
    { data: users },
    { data: challenges },
    { data: checkins },
    { data: pointsAll },
  ] = await Promise.all([
    supabase.from('users').select('*').order('name'),
    supabase.from('weekly_challenges').select('*').order('start_date', { ascending: false }),
    supabase.from('daily_checkins').select('*, user:users(name)').order('date', { ascending: false }).limit(200),
    supabase.from('points').select('*'),
  ])

  return (
    <AdminClient
      users={users ?? []}
      challenges={challenges ?? []}
      checkins={checkins as (typeof checkins extends null ? never : NonNullable<typeof checkins>[number] & { user: { name: string } })[]}
      pointsAll={pointsAll ?? []}
    />
  )
}
