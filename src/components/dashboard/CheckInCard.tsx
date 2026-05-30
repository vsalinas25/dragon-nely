'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CheckinForm } from '@/types'

interface Toggle { key: keyof CheckinForm; label: string; icon: string; pts: number }

const TOGGLES: Toggle[] = [
  { key: 'sugar_free',  label: 'Sem Açúcar', icon: '🚫🍬', pts: 10 },
  { key: 'low_carb',   label: 'Low Carb',   icon: '🥗',   pts: 8  },
  { key: 'exercised',  label: 'Exercitou',  icon: '🏃',   pts: 10 },
  { key: 'drank_water', label: 'Bebeu 2L',  icon: '💧',   pts: 5  },
]

interface Props {
  alreadyCheckedIn: boolean
  onSuccess: (pts: number, streak: number, newBadges: string[]) => void
}

export default function CheckInCard({ alreadyCheckedIn, onSuccess }: Props) {
  const [form, setForm] = useState<CheckinForm>({
    sugar_free: false, low_carb: false, exercised: false, drank_water: false,
  })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const activeCount = Object.values(form).filter(Boolean).length

  function toggle(key: keyof CheckinForm) {
    setForm((p) => ({ ...p, [key]: !p[key] }))
  }

  async function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao fazer check-in'); return }
      onSuccess(data.points, data.streak.current_streak, data.newBadges)
    })
  }

  if (alreadyCheckedIn) {
    return (
      <div className="ios-card p-5 flex items-center gap-4 animate-slide-up">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(46,204,138,0.15)' }}
        >
          <CheckCircle2 className="w-6 h-6" style={{ color: '#2ECC8A' }} />
        </div>
        <div>
          <p className="font-bold" style={{ color: '#0D3B2E' }}>Check-in concluído ✓</p>
          <p className="text-sm" style={{ color: '#1D9E75' }}>Ótimo trabalho hoje! Volte amanhã.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ios-card p-5 space-y-4">
      {/* Header with mini ring */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ios-section-label">Check-in de Hoje</p>
          <p className="font-bold" style={{ color: '#0D3B2E' }}>
            {activeCount === 0 ? 'Selecione suas conquistas' : `${activeCount} de 4 selecionados`}
          </p>
        </div>
        {/* Mini completion ring */}
        <div className="relative w-12 h-12">
          <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(46,204,138,0.15)" strokeWidth="5" />
            <circle
              cx="24" cy="24" r="19" fill="none"
              stroke="#2ECC8A" strokeWidth="5"
              strokeDasharray={2 * Math.PI * 19}
              strokeDashoffset={2 * Math.PI * 19 * (1 - activeCount / 4)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black" style={{ color: '#2ECC8A' }}>{activeCount}/4</span>
          </div>
        </div>
      </div>

      {/* Habit grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {TOGGLES.map(({ key, label, icon, pts }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={cn('habit-btn h-[88px]', form[key] ? 'active' : 'inactive')}
          >
            <span className="text-[28px] leading-none">{icon}</span>
            <span
              className="text-[13px] font-semibold leading-tight"
              style={{ color: form[key] ? '#2ECC8A' : '#F0FFF8' }}
            >
              {label}
            </span>
            <span
              className="text-[11px] font-medium"
              style={{ color: form[key] ? 'rgba(46,204,138,0.7)' : '#A8F0D0' }}
            >
              +{pts} pts
            </span>
          </button>
        ))}
      </div>

      {activeCount === 4 && (
        <p className="text-center text-xs font-semibold animate-slide-up" style={{ color: '#FFE566' }}>
          🎯 Bônus +15 pts por completar tudo!
        </p>
      )}

      {error && (
        <p
          className="text-sm rounded-xl px-3 py-2 text-center"
          style={{ background: 'rgba(231,76,60,0.15)', color: '#FF6B6B' }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending || activeCount === 0}
        className="w-full py-4 rounded-2xl font-bold text-[15px] transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        style={
          activeCount > 0
            ? { background: '#1D9E75', color: '#F0FFF8' }
            : { background: 'rgba(255,255,255,0.06)', color: 'rgba(240,255,248,0.3)', cursor: 'not-allowed' }
        }
      >
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</>
          : '🔥 Fazer Check-in'
        }
      </button>
    </div>
  )
}
