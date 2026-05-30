import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPushToAll } from '@/lib/notifications/push'
import { todayInBrazil } from '@/lib/utils'

// Called 23:00 UTC = 20:00 BRT — remind users who haven't checked in
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = todayInBrazil()

  // Find users who haven't checked in today
  const { data: allUsers } = await supabase.from('users').select('id')
  const { data: checkedIn } = await supabase
    .from('daily_checkins')
    .select('user_id')
    .eq('date', today)

  const checkedInIds = new Set((checkedIn ?? []).map((c) => c.user_id))
  const pendingIds = (allUsers ?? [])
    .filter((u) => !checkedInIds.has(u.id))
    .map((u) => u.id)

  if (pendingIds.length === 0) {
    return NextResponse.json({ success: true, notified: 0 })
  }

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .in('user_id', pendingIds)

  if (subs && subs.length > 0) {
    await sendPushToAll(subs.map((s) => s.subscription), {
      title: '🔥 Lembrete de Check-in',
      body: 'Você ainda não fez seu check-in hoje! Não perca seu streak.',
    })
  }

  return NextResponse.json({ success: true, notified: subs?.length ?? 0 })
}
