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

      const { data: chs, error } = await supabase
        .from('weekly_challenges')
        .select('*, completions:challenge_completions(*, user:users(*))')
        .order('start_date', { ascending: false })

      if (error) {
        // Fallback: fetch without join
        const { data: simple } = await supabase
          .from('weekly_challenges')
          .select('*')
          .order('start_date', { ascending: false })
        const withEmpty = (simple ?? []).map((c) => ({ ...c, completions: [] }))
        setChallenges(withEmpty as ChallengeWithCompletions[])
      } else {
        setChallenges((chs as ChallengeWithCompletions[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function markComplete(challenge: ChallengeWithCompletions) {
    setCompleting(challenge.id)

    // Always get fresh user from auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: 'Erro: faça login novamente', variant: 'destructive' })
      setCompleting(null)
      return
    }

    const { error } = await supabase
      .from('challenge_completions')
      .insert({ challenge_id: challenge.id, user_id: user.id })

    if (error) {
      toast({ title: `Erro: ${error.message}`, variant: 'destructive' })
    } else {
      // Award points
      const res = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, rewardPoints: challenge.reward_points }),
      })
      if (res.ok) {
        toast({ title: `+${challenge.reward_points} pontos! 🏆`, description: 'Desafio concluído!' })
      }
      // Refresh challenges
      const { data: chs } = await supabase
        .from('weekly_challenges')
        .select('*, completions:challenge_completions(*, user:users(*))')
        .order('start_date', { ascending: false })
      if (chs) setChallenges(chs as ChallengeWithCompletions[])
    }
    setCompleting(null)
  }

  const active   = challenges.filter((c) => c.start_date <= today && c.end_date >= today)
  const upcoming = challenges.filter((c) => c.start_date > today)
  const past     = challenges.filter((c) => c.end_date < today)

  return (
    <div className="p-4 space-y-5">
      <div className="pt-2">
        <h1 className="text-2xl font-black" style={{ color: '#0D3B2E' }}>Desafios 🏆</h1>
        <p className="text-sm mt-1" style={{ color: '#1D9E75' }}>Desafios semanais da família</p>
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

          {active.length === 0 && upcoming.length === 0 && (
            <div className="text-center py-8 rounded-2xl" style={{ background: 'rgba(29,158,117,0.06)' }}>
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-sm" style={{ color: '#1D9E75' }}>Nenhum desafio ativo esta semana</p>
            </div>
          )}

          {/* Upcoming challenges */}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#E0A800' }}>
                ⏳ Em breve
              </h2>
              {upcoming.map((ch) => (
                <ChallengeCard key={ch.id} challenge={ch} completed={false} upcoming loading={false} onComplete={() => {}} />
              ))}
            </section>
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
  upcoming,
  loading,
  onComplete,
}: {
  challenge: ChallengeWithCompletions
  completed: boolean
  past?: boolean
  upcoming?: boolean
  loading: boolean
  onComplete: () => void
}) {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: '#FFFFFF',
        border: upcoming ? '1.5px solid rgba(224,168,0,0.35)' : '1px solid rgba(29,158,117,0.2)',
        boxShadow: '0 2px 12px rgba(13,59,46,0.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* EM BREVE badge */}
          {upcoming && (
            <span
              className="inline-block text-xs font-black tracking-widest px-2.5 py-1 rounded-full mb-2"
              style={{ background: 'rgba(224,168,0,0.15)', color: '#A87200', letterSpacing: '1.5px' }}
            >
              EM BREVE
            </span>
          )}
          <h3 className="font-bold" style={{ fontSize: 16, color: '#0D3B2E' }}>{challenge.title}</h3>
          <p className="mt-0.5 leading-snug" style={{ fontSize: 14, color: '#1D9E75' }}>{challenge.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <span
            className="inline-block text-xs font-black px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(224,168,0,0.12)', color: '#A87200' }}
          >
            +{challenge.reward_points} pts
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs" style={{ color: '#1D9E75' }}>
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
          <span className="text-xs font-semibold" style={{ color: '#1D9E75' }}>
            {challenge.completions.length} {challenge.completions.length === 1 ? 'já fez ✅' : 'já fizeram ✅'}
          </span>
        </div>
      )}

      {upcoming && (
        <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center" style={{ background: 'rgba(224,168,0,0.1)', color: '#A87200' }}>
          ⏳ Começa em {formatDateBR(challenge.start_date)}
        </div>
      )}

      {!past && !upcoming && (
        <button
          onClick={onComplete}
          disabled={completed || loading}
          className="w-full rounded-2xl font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60"
          style={{
            height: 54,
            fontSize: 16,
            ...(completed
              ? { background: 'rgba(29,158,117,0.1)', color: '#1D9E75', border: '1.5px solid rgba(29,158,117,0.3)' }
              : { background: 'linear-gradient(135deg, #1D9E75, #2ECC8A)', color: '#fff', boxShadow: '0 4px 16px rgba(29,158,117,0.3)' }
            )
          }}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : completed ? (
            <><CheckCircle2 className="w-5 h-5" /> Feito! ✅</>
          ) : (
            'Marcar como Feito ✅'
          )}
        </button>
      )}
    </div>
  )
}
