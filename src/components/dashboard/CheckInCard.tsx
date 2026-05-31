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
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(29,158,117,0.12)' }}
        >
          <CheckCircle2 className="w-7 h-7" style={{ color: '#1D9E75' }} />
        </div>
        <div>
          <p className="font-bold" style={{ fontSize: 18, color: '#0D3B2E' }}>Check-in concluído ✓</p>
          <p className="mt-0.5" style={{ fontSize: 15, color: '#1D9E75' }}>Ótimo trabalho hoje! Volte amanhã.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ios-card p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="ios-section-label">Check-in de Hoje</p>
          <p className="font-bold" style={{ fontSize: 18, color: '#0D3B2E' }}>
            {activeCount === 0 ? 'Selecione suas conquistas' : `${activeCount} de 4 selecionados`}
          </p>
        </div>
        {/* Mini ring */}
        <div className="relative w-14 h-14">
          <svg width="56" height="56" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(29,158,117,0.15)" strokeWidth="5" />
            <circle
              cx="28" cy="28" r="22" fill="none"
              stroke="#1D9E75" strokeWidth="5"
              strokeDasharray={2 * Math.PI * 22}
              strokeDashoffset={2 * Math.PI * 22 * (1 - activeCount / 4)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-black" style={{ fontSize: 13, color: '#1D9E75' }}>{activeCount}/4</span>
          </div>
        </div>
      </div>

      {/* Habit grid */}
      <div className="grid grid-cols-2 gap-3">
        {TOGGLES.map(({ key, label, icon, pts }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl transition-all duration-150 active:scale-95"
            style={{
              height: 100,
              padding: '12px 8px',
              background: form[key] ? 'rgba(29,158,117,0.12)' : '#FFFFFF',
              border: form[key] ? '2px solid #1D9E75' : '1.5px solid rgba(29,158,117,0.25)',
              boxShadow: form[key] ? '0 0 12px rgba(29,158,117,0.15)' : '0 1px 4px rgba(13,59,46,0.08)',
            }}
          >
            <span style={{ fontSize: 30, lineHeight: 1 }}>{icon}</span>
            <span
              className="font-semibold text-center leading-tight"
              style={{ fontSize: 14, color: form[key] ? '#0D3B2E' : '#0D3B2E' }}
            >
              {label}
            </span>
            <span
              className="font-semibold"
              style={{ fontSize: 12, color: form[key] ? '#1D9E75' : '#1D9E75' }}
            >
              +{pts} pts
            </span>
          </button>
        ))}
      </div>

      {activeCount === 4 && (
        <p className="text-center font-semibold animate-slide-up" style={{ fontSize: 14, color: '#E0A800' }}>
          🎯 Bônus +15 pts por completar tudo!
        </p>
      )}

      {error && (
        <p
          className="text-center rounded-xl px-3 py-2"
          style={{ fontSize: 14, background: 'rgba(231,76,60,0.1)', color: '#C0392B' }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending || activeCount === 0}
        className="w-full rounded-2xl font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
        style={{
          height: 56,
          fontSize: 17,
          background: activeCount > 0 ? 'linear-gradient(135deg, #1D9E75, #2ECC8A)' : 'rgba(29,158,117,0.1)',
          color: activeCount > 0 ? '#FFFFFF' : 'rgba(29,158,117,0.4)',
          cursor: activeCount === 0 ? 'not-allowed' : 'pointer',
          boxShadow: activeCount > 0 ? '0 4px 16px rgba(29,158,117,0.3)' : 'none',
        }}
      >
        {isPending
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando…</>
          : '🔥 Fazer Check-in'
        }
      </button>
    </div>
  )
}
