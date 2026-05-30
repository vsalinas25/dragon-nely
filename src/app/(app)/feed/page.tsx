'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/shared/Avatar'
import { timeAgo } from '@/lib/utils'
import type { ActivityFeedItem, User } from '@/types'

type FeedEntry = ActivityFeedItem & { user: User }

export default function FeedPage() {
  const [items, setItems] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('activity_feed')
        .select('*, user:users(*)')
        .order('created_at', { ascending: false })
        .limit(50)

      setItems((data as FeedEntry[]) ?? [])
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_feed' },
        async (payload) => {
          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', payload.new.user_id)
            .single()

          if (user) {
            setItems((prev) => [{ ...payload.new as ActivityFeedItem, user }, ...prev])
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const EVENT_ICONS: Record<string, string> = {
    checkin: '🔥',
    badge: '🏅',
    challenge: '🏆',
    weight_loss: '📉',
  }

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Feed da Família</h1>
        <p className="text-sm text-gray-500">Atividades recentes</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">🌱</p>
          <p className="text-sm">Nenhuma atividade ainda. Faça seu primeiro check-in!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-gray-100 animate-slide-up">
              <Avatar user={item.user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-tight">
                  {EVENT_ICONS[item.event_type] ?? '📌'} {item.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
