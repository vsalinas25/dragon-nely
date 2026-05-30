import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeId, rewardPoints } = await req.json()
  if (!challengeId || !rewardPoints) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: pts } = await supabase.from('points').select('*').eq('user_id', user.id).single()

  await supabase
    .from('points')
    .upsert({
      user_id: user.id,
      total_points: (pts?.total_points ?? 0) + rewardPoints,
      monthly_points: (pts?.monthly_points ?? 0) + rewardPoints,
    }, { onConflict: 'user_id' })

  const { data: userData } = await supabase.from('users').select('name').eq('id', user.id).single()
  const { data: ch } = await supabase.from('weekly_challenges').select('title').eq('id', challengeId).single()

  await supabase.from('activity_feed').insert({
    user_id: user.id,
    event_type: 'challenge',
    message: `${userData?.name ?? 'Alguém'} concluiu o desafio: ${ch?.title ?? ''} 🏆`,
    metadata: { challenge_id: challengeId, points: rewardPoints },
  })

  return NextResponse.json({ success: true })
}
