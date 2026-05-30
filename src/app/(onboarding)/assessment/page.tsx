'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssessmentData {
  current_weight_kg: string
  desired_weight_kg: string
  height_cm: string
  age: string
  daily_water_l: string
  activity_level: number
}

const ACTIVITY_LEVELS = [
  { level: 1, label: 'Sedentário',      description: 'Quase sem atividade física',          icon: '🛋️' },
  { level: 2, label: 'Leve',            description: 'Caminhadas ocasionais',                icon: '🚶' },
  { level: 3, label: 'Moderado',        description: 'Exercício 2–3x por semana',            icon: '🚴' },
  { level: 4, label: 'Ativo',           description: 'Exercício 4–5x por semana',            icon: '🏋️' },
  { level: 5, label: 'Muito ativo',     description: 'Exercício diário ou trabalho físico',  icon: '🏃' },
]

const WATER_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]

export default function AssessmentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<AssessmentData>({
    current_weight_kg: '',
    desired_weight_kg: '',
    height_cm: '',
    age: '',
    daily_water_l: '1.5',
    activity_level: 0,
  })

  const TOTAL_STEPS = 6

  function set(key: keyof AssessmentData, value: string | number) {
    setData((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return parseFloat(data.current_weight_kg) > 0
      case 1: return parseFloat(data.desired_weight_kg) > 0
      case 2: return parseFloat(data.height_cm) > 0
      case 3: return parseInt(data.age) > 0
      case 4: return parseFloat(data.daily_water_l) > 0
      case 5: return data.activity_level > 0
      default: return false
    }
  }

  function next() {
    if (!canProceed()) { setError('Por favor preencha este campo'); return }
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1)
    else handleSubmit()
  }

  function back() {
    if (step > 0) setStep((s) => s - 1)
  }

  async function handleSubmit() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    // Save assessment
    const { error: assessErr } = await supabase.from('assessments').upsert({
      user_id:           user.id,
      current_weight_kg: parseFloat(data.current_weight_kg),
      desired_weight_kg: parseFloat(data.desired_weight_kg),
      height_cm:         parseFloat(data.height_cm),
      age:               parseInt(data.age),
      daily_water_l:     parseFloat(data.daily_water_l),
      activity_level:    data.activity_level,
    }, { onConflict: 'user_id' })

    if (assessErr) { setError('Erro ao salvar. Tente novamente.'); setSaving(false); return }

    // Log starting weight
    await supabase.from('weight_logs').insert({
      user_id:   user.id,
      weight_kg: parseFloat(data.current_weight_kg),
    })

    // Mark onboarding complete
    await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id)

    router.replace('/dashboard')
  }

  const progress = ((step) / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex flex-col">
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 w-full">
        <div
          className="h-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
        {/* Step counter */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <button
            onClick={back}
            className={cn('p-2 rounded-xl text-gray-400 hover:text-gray-600 transition-colors', step === 0 && 'invisible')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold text-gray-400">
            {step + 1} de {TOTAL_STEPS}
          </span>
          <div className="w-9" />
        </div>

        {/* Steps */}
        <div className="flex-1">
          {step === 0 && (
            <Step
              emoji="⚖️"
              title="Qual é seu peso atual?"
              subtitle="Usaremos isso para acompanhar sua evolução"
            >
              <NumberInput
                value={data.current_weight_kg}
                onChange={(v) => set('current_weight_kg', v)}
                unit="kg"
                placeholder="Ex: 85.0"
                min={30}
                max={300}
              />
            </Step>
          )}

          {step === 1 && (
            <Step
              emoji="🎯"
              title="Qual é seu peso ideal?"
              subtitle="Sua meta de chegada"
            >
              <NumberInput
                value={data.desired_weight_kg}
                onChange={(v) => set('desired_weight_kg', v)}
                unit="kg"
                placeholder="Ex: 75.0"
                min={30}
                max={300}
              />
              {data.current_weight_kg && data.desired_weight_kg && (
                <p className="text-center text-sm text-brand-600 font-semibold mt-3">
                  Meta: perder {(parseFloat(data.current_weight_kg) - parseFloat(data.desired_weight_kg)).toFixed(1)} kg 💪
                </p>
              )}
            </Step>
          )}

          {step === 2 && (
            <Step
              emoji="📏"
              title="Qual é sua altura?"
              subtitle="Para calcular seu IMC"
            >
              <NumberInput
                value={data.height_cm}
                onChange={(v) => set('height_cm', v)}
                unit="cm"
                placeholder="Ex: 170"
                min={100}
                max={250}
              />
              {data.height_cm && data.current_weight_kg && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  IMC atual: {(parseFloat(data.current_weight_kg) / Math.pow(parseFloat(data.height_cm) / 100, 2)).toFixed(1)}
                </p>
              )}
            </Step>
          )}

          {step === 3 && (
            <Step
              emoji="🎂"
              title="Quantos anos você tem?"
              subtitle="Para personalizar suas metas"
            >
              <NumberInput
                value={data.age}
                onChange={(v) => set('age', v)}
                unit="anos"
                placeholder="Ex: 35"
                min={10}
                max={100}
                isInt
              />
            </Step>
          )}

          {step === 4 && (
            <Step
              emoji="💧"
              title="Quanto de água você bebe por dia?"
              subtitle="Sua ingestão atual (antes do desafio)"
            >
              <div className="grid grid-cols-4 gap-2 mt-2">
                {WATER_OPTIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => set('daily_water_l', String(l))}
                    className={cn(
                      'py-3 rounded-xl border-2 font-semibold text-sm transition-all',
                      parseFloat(data.daily_water_l) === l
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    )}
                  >
                    {l}L
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 5 && (
            <Step
              emoji="🏃"
              title="Nível de atividade física"
              subtitle="Como é sua rotina hoje?"
            >
              <div className="space-y-2.5 mt-2">
                {ACTIVITY_LEVELS.map(({ level, label, description, icon }) => (
                  <button
                    key={level}
                    onClick={() => set('activity_level', level)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                      data.activity_level === level
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-semibold text-sm', data.activity_level === level ? 'text-brand-700' : 'text-gray-800')}>
                        {level}. {label}
                      </p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    {data.activity_level === level && (
                      <Check className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </Step>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center mb-3">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={next}
          disabled={saving || !canProceed()}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-white text-base transition-all',
            'flex items-center justify-center gap-2',
            canProceed() ? 'bg-brand-500 hover:bg-brand-600 active:scale-[0.98]' : 'bg-gray-200 text-gray-400',
            'disabled:cursor-not-allowed'
          )}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando…
            </>
          ) : step === TOTAL_STEPS - 1 ? (
            <>
              Começar o Desafio! 🚀
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function Step({ emoji, title, subtitle, children }: {
  emoji: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="animate-slide-up">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function NumberInput({ value, onChange, unit, placeholder, min, max, isInt }: {
  value: string
  onChange: (v: string) => void
  unit: string
  placeholder: string
  min: number
  max: number
  isInt?: boolean
}) {
  return (
    <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition-colors">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={isInt ? 1 : 0.1}
        className="flex-1 text-2xl font-bold text-gray-900 outline-none bg-transparent tabular-nums"
      />
      <span className="text-lg font-semibold text-gray-400">{unit}</span>
    </div>
  )
}
