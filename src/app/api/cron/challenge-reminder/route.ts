import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPushToAll } from '@/lib/notifications/push'
import { todayInBrazil } from '@/lib/utils'

// Called Monday 12:00 UTC = 09:00 BRT
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = todayInBrazil()

  const { data: challenge } = await supabase
    .from('weekly_challenges')
    .select('*')
    .lte('start_date', today)
    .gte('end_date', today)
    .single()

  if (challenge) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')

    if (subs && subs.length > 0) {
      await sendPushToAll(
        subs.map((s) => s.subscription),
        {
          title: '🏆 Novo Desafio Semanal!',
          body: `${challenge.title} — ${challenge.reward_points} pts de recompensa`,
        }
      )
    }
  }

  return NextResponse.json({ success: true })
}
