import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Called at 02:00 UTC = 23:00 BRT the previous day (safe window after midnight BRT)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Call the DB function which handles the penalty logic
  const { error } = await supabase.rpc('apply_daily_penalty')

  if (error) {
    console.error('Penalty cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
}
