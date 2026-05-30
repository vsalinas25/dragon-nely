'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Scale, Ruler, Award, Loader2 } from 'lucide-react'
import PhaseIndicator from '@/components/shared/PhaseIndicator'
import BadgesGrid from '@/components/progress/BadgesGrid'
import { useToast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User, WeightLog, Measurement, Streak, BadgeType } from '@/types'

const WeightChart = dynamic(() => import('@/components/progress/WeightChart'), { ssr: false })
const MeasurementsChart = dynamic(() => import('@/components/progress/MeasurementsChart'), { ssr: false })

interface Props {
  userId: string
  profile: User
  weightLogs: WeightLog[]
  measurements: Measurement[]
  badges: BadgeType[]
  checkinDates: string[]
  streak: Streak
}

export default function ProgressClient({ profile, weightLogs: initialWeights, measurements: initialMeasurements, badges, checkinDates, streak }: Props) {
  const { toast } = useToast()
  const supabase = createClient()

  const [weights, setWeights] = useState(initialWeights)
  const [newWeight, setNewWeight] = useState('')
  const [savingWeight, setSavingWeight] = useState(false)

  const [measurements, setMeasurements] = useState(initialMeasurements)
  const [newWaist, setNewWaist] = useState('')
  const [newHip, setNewHip] = useState('')
  const [savingMeasurements, setSavingMeasurements] = useState(false)

  const now = new Date()
  const thisMonth = now.toISOString().slice(0, 7)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const checkedThisMonth = checkinDates.filter((d) => d.startsWith(thisMonth)).length

  async function saveWeight() {
    const kg = parseFloat(newWeight)
    if (isNaN(kg) || kg < 20 || kg > 300) {
      toast({ title: 'Peso inválido', variant: 'destructive' })
      return
    }
    setSavingWeight(true)
    const { data, error } = await supabase
      .from('weight_logs')
      .insert({ user_id: profile.id, weight_kg: kg })
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } else {
      setWeights((prev) => [...prev, data])
      setNewWeight('')
      toast({ title: 'Peso registrado! ✓' })
    }
    setSavingWeight(false)
  }

  async function saveMeasurements() {
    const waist = newWaist ? parseFloat(newWaist) : null
    const hip = newHip ? parseFloat(newHip) : null
    if (!waist && !hip) return

    setSavingMeasurements(true)
    const { data, error } = await supabase
      .from('measurements')
      .insert({ user_id: profile.id, waist_cm: waist, hip_cm: hip })
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } else {
      setMeasurements((prev) => [...prev, data])
      setNewWaist('')
      setNewHip('')
      toast({ title: 'Medidas registradas! ✓' })
    }
    setSavingMeasurements(false)
  }

  const latestWeight = weights.at(-1)?.weight_kg
  const startWeight = weights[0]?.weight_kg
  const weightDiff = latestWeight && startWeight ? latestWeight - startWeight : null

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold text-gray-900">Meu Progresso</h1>
        <PhaseIndicator createdAt={profile.created_at} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Streak atual" value={`${streak.current_streak}d`} icon="🔥" />
        <Stat label="Melhor streak" value={`${streak.longest_streak}d`} icon="⚡" />
        <Stat label="Check-ins/mês" value={`${checkedThisMonth}/${daysInMonth}`} icon="✅" />
      </div>

      {/* Weight */}
      <section className="ios-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand-500" />
            <h2 className="font-semibold text-gray-900">Peso</h2>
          </div>
          {weightDiff !== null && (
            <span className={cn('text-sm font-bold', weightDiff < 0 ? 'text-brand-600' : 'text-red-500')}>
              {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
            </span>
          )}
        </div>
        <WeightChart logs={weights} />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Ex: 82.5"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:outline-none focus:ring-2 focus:ring-[#30D158]/30 focus:border-[#30D158] transition-colors"
          />
          <button
            onClick={saveWeight}
            disabled={savingWeight || !newWeight}
            className="px-4 py-2 bg-[#1C1C1E] text-white text-sm font-semibold rounded-xl disabled:bg-[#E5E5EA] disabled:text-[#8E8E93] flex items-center gap-1 transition-colors"
          >
            {savingWeight ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Salvar
          </button>
        </div>
      </section>

      {/* Measurements */}
      <section className="ios-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-purple-500" />
          <h2 className="font-semibold text-gray-900">Medidas</h2>
        </div>
        <MeasurementsChart logs={measurements} />
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Cintura (cm)"
              value={newWaist}
              onChange={(e) => setNewWaist(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:outline-none focus:ring-2 focus:ring-[#30D158]/30 focus:border-[#30D158] transition-colors"
            />
            <input
              type="number"
              placeholder="Quadril (cm)"
              value={newHip}
              onChange={(e) => setNewHip(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-[#E5E5EA] bg-[#F2F2F7] focus:outline-none focus:ring-2 focus:ring-[#30D158]/30 focus:border-[#30D158] transition-colors"
            />
          </div>
          <button
            onClick={saveMeasurements}
            disabled={savingMeasurements || (!newWaist && !newHip)}
            className="w-full py-2.5 bg-[#1C1C1E] text-white text-sm font-semibold rounded-xl disabled:bg-[#E5E5EA] disabled:text-[#8E8E93] flex items-center justify-center gap-1.5 transition-colors"
          >
            {savingMeasurements ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
            Salvar Medidas
          </button>
        </div>
      </section>

      {/* Badges */}
      <section className="ios-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          <h2 className="font-semibold text-gray-900">Conquistas</h2>
          <span className="ml-auto text-xs text-gray-400">
            {badges.length}/{7} desbloqueadas
          </span>
        </div>
        <BadgesGrid earned={badges} />
      </section>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="ios-card p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-black text-[#1C1C1E] tabular-nums">{value}</div>
      <div className="text-[10px] text-[#8E8E93] font-medium mt-0.5 leading-tight">{label}</div>
    </div>
  )
}
