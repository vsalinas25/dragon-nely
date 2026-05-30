'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LeaderboardTable from '@/components/rankings/LeaderboardTable'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'

export default function RankingsPage() {
  const [tab, setTab] = useState<'consistency' | 'evolution'>('consistency')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const [{ data: users }, { data: streaks }, { data: points }, { data: weightLogs }] =
        await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('streaks').select('*'),
          supabase.from('points').select('*'),
          supabase.from('weight_logs').select('user_id,weight_kg,logged_at').order('logged_at'),
        ])

      if (!users || !streaks || !points) return

      const result: LeaderboardEntry[] = users.map((u) => {
        const streak = streaks.find((s) => s.user_id === u.id) ?? {
          id: '', user_id: u.id, current_streak: 0, longest_streak: 0, last_checkin_date: null,
        }
        const pts = points.find((p) => p.user_id === u.id) ?? {
          id: '', user_id: u.id, total_points: 0, monthly_points: 0, last_reset_at: '',
        }
        const userWeights = (weightLogs ?? []).filter((w) => w.user_id === u.id)
        let weightChangePct: number | null = null
        if (userWeights.length >= 2) {
          const start = userWeights[0].weight_kg
          const latest = userWeights[userWeights.length - 1].weight_kg
          weightChangePct = ((latest - start) / start) * 100
        }
        return { user: u, streak, points: pts, weightChangePct }
      })

      setEntries(result)
      setLoading(false)
    }

    load()
  }, [supabase])

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Rankings</h1>
        <p className="text-sm text-gray-500">Atualizado em tempo real</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#E5E5EA] p-1 rounded-xl gap-1">
        {(['consistency', 'evolution'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all',
              tab === t
                ? 'bg-white text-[#1C1C1E] shadow-sm'
                : 'text-[#8E8E93]'
            )}
          >
            {t === 'consistency' ? '🔥 Consistência' : '📉 Evolução'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <LeaderboardTable
          initial={entries}
          mode={tab}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
