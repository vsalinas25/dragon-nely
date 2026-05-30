'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/types'

export function useRealtimeLeaderboard(initial: LeaderboardEntry[]) {
  const [entries, setEntries] = useState(initial)
  const supabase = createClient()

  useEffect(() => {
    async function refetch() {
      const { data: users } = await supabase.from('users').select('*')
      const { data: streaks } = await supabase.from('streaks').select('*')
      const { data: points } = await supabase.from('points').select('*')
      const { data: weightLogs } = await supabase
        .from('weight_logs')
        .select('user_id, weight_kg, logged_at')
        .order('logged_at', { ascending: true })

      if (!users || !streaks || !points) return

      const updated: LeaderboardEntry[] = users.map((user) => {
        const streak = streaks.find((s) => s.user_id === user.id) ?? {
          id: '', user_id: user.id, current_streak: 0, longest_streak: 0, last_checkin_date: null,
        }
        const pts = points.find((p) => p.user_id === user.id) ?? {
          id: '', user_id: user.id, total_points: 0, monthly_points: 0, last_reset_at: '',
        }

        const userWeights = (weightLogs ?? []).filter((w) => w.user_id === user.id)
        let weightChangePct: number | null = null
        if (userWeights.length >= 2) {
          const start = userWeights[0].weight_kg
          const latest = userWeights[userWeights.length - 1].weight_kg
          weightChangePct = ((latest - start) / start) * 100
        }

        return { user, streak, points: pts, weightChangePct }
      })

      setEntries(updated)
    }

    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'points' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks' }, refetch)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  return entries
}
