'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Flame, CheckCircle2, Loader2, Calendar } from 'lucide-react'
import Avatar from '@/components/shared/Avatar'
import { formatDateBR, todayInBrazil } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { WeeklyChallenge, ChallengeCompletion, User } from '@/types'

type ChallengeWithCompletions = WeeklyChallenge & {
  completions: (ChallengeCompletion & { user: User })[]
}

export default function ChallengesPage() {
  const { toast } = useToast()
  const supabase = createClient()

  const [challenges, setChallenges] = useState<ChallengeWithCompletions[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)

  const today = todayInBrazil()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const { data: chs } = await supabase
        .from('weekly_challenges')
        .select('*, completions:challenge_completions(*, user:users(*))')
        .order('start_date', { ascending: false })

      setChallenges((chs as ChallengeWithCompletions[]) ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  async function markComplete(challenge: ChallengeWithCompletions) {
    setCompleting(challenge.id)
    const { error } = await supabase
      .from('challenge_completions')
      .insert({ challenge_id: challenge.id, user_id: currentUserId })

    if (error) {
      toast({ title: 'Erro ao completar desafio', variant: 'destructive' })
    } else {
      // Award points
      await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, rewardPoints: challenge.reward_points }),
      })
      toast({ title: `+${challenge.reward_points} pontos! 🏆` })
      // Refresh
      const { data: chs } = await supabase
        .from('weekly_challenges')
        .select('*, completions:challenge_completions(*, user:users(*))')
        .order('start_date', { ascending: false })
      setChallenges((chs as ChallengeWithCompletions[]) ?? [])
    }
    setCompleting(null)
  }

  const active = challenges.filter((c) => c.start_date <= today && c.end_date >= today)
  const past = challenges.filter((c) => c.end_date < today)

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">Desafios</h1>
        <p className="text-sm text-gray-500">Desafios semanais da família</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Active challenges */}
          {active.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> Desafios Ativos
              </h2>
              {active.map((ch) => {
                const myCompletion = ch.completions.find((c) => c.user_id === currentUserId)
                return (
                  <ChallengeCard
                    key={ch.id}
                    challenge={ch}
                    completed={!!myCompletion}
                    loading={completing === ch.id}
                    onComplete={() => markComplete(ch)}
                  />
                )
              })}
            </section>
          )}

          {active.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-2xl">
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-sm text-gray-500">Nenhum desafio ativo esta semana</p>
            </div>
          )}

          {/* Past challenges */}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Desafios Anteriores
              </h2>
              {past.map((ch) => (
                <ChallengeCard
                  key={ch.id}
                  challenge={ch}
                  completed={ch.completions.some((c) => c.user_id === currentUserId)}
                  past
                  loading={false}
                  onComplete={() => {}}
                />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  )
}

function ChallengeCard({
  challenge,
  completed,
  past,
  loading,
  onComplete,
}: {
  challenge: ChallengeWithCompletions
  completed: boolean
  past?: boolean
  loading: boolean
  onComplete: () => void
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900">{challenge.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5 leading-snug">{challenge.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="inline-block bg-yellow-50 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">
            +{challenge.reward_points} pts
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Calendar className="w-3 h-3" />
        <span>{formatDateBR(challenge.start_date)} – {formatDateBR(challenge.end_date)}</span>
      </div>

      {/* Completions */}
      {challenge.completions.length > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            {challenge.completions.slice(0, 5).map((c) => (
              <Avatar key={c.id} user={c.user} size="sm" className="border-2 border-white" />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {challenge.completions.length} {challenge.completions.length === 1 ? 'concluiu' : 'concluíram'}
          </span>
        </div>
      )}

      {!past && (
        <button
          onClick={onComplete}
          disabled={completed || loading}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
            ${completed
              ? 'bg-brand-50 text-brand-600 border border-brand-200 cursor-default'
              : 'bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]'
            } disabled:opacity-60`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : completed ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Concluído ✓
            </>
          ) : (
            '🏁 Marcar como Concluído'
          )}
        </button>
      )}
    </div>
  )
}
