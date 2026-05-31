'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, Download, Loader2, Shield } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn, formatDateBR } from '@/lib/utils'
import type { User, WeeklyChallenge, Points } from '@/types'

interface CheckinRow {
  id: string
  user_id: string
  date: string
  sugar_free: boolean
  low_carb: boolean
  exercised: boolean
  drank_water: boolean
  points_earned: number
  user: { name: string }
}

interface Props {
  users: User[]
  challenges: WeeklyChallenge[]
  checkins: CheckinRow[]
  pointsAll: Points[]
}

export default function AdminClient({ users, challenges: initialChallenges, checkins, pointsAll }: Props) {
  const { toast } = useToast()
  const supabase = createClient()

  const [tab, setTab] = useState<'challenges' | 'users' | 'history'>('challenges')
  const [challenges, setChallenges] = useState(initialChallenges)

  // New challenge form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rewardPts, setRewardPts] = useState('50')
  const [saving, setSaving] = useState(false)

  // Points adjustment
  const [adjustUserId, setAdjustUserId] = useState('')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjusting, setAdjusting] = useState(false)

  async function createChallenge() {
    if (!title || !description || !startDate || !endDate) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }
    setSaving(true)
    const { data, error } = await supabase
      .from('weekly_challenges')
      .insert({ title, description, start_date: startDate, end_date: endDate, reward_points: parseInt(rewardPts) })
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro ao criar desafio', variant: 'destructive' })
    } else {
      setChallenges((prev) => [data, ...prev])
      setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setRewardPts('50')
      toast({ title: 'Desafio criado! ✓' })
    }
    setSaving(false)
  }

  async function adjustPoints() {
    const amount = parseInt(adjustAmount)
    if (!adjustUserId || isNaN(amount)) {
      toast({ title: 'Selecione um usuário e valor', variant: 'destructive' })
      return
    }
    setAdjusting(true)
    const current = pointsAll.find((p) => p.user_id === adjustUserId)
    await supabase.from('points').upsert({
      user_id: adjustUserId,
      total_points: Math.max(0, (current?.total_points ?? 0) + amount),
      monthly_points: Math.max(0, (current?.monthly_points ?? 0) + amount),
    }, { onConflict: 'user_id' })

    toast({ title: `Pontos ajustados: ${amount > 0 ? '+' : ''}${amount}` })
    setAdjustUserId(''); setAdjustAmount('')
    setAdjusting(false)
  }

  function exportCSV() {
    const rows = [
      ['Data', 'Usuário', 'Sem Açúcar', 'Low Carb', 'Exercício', 'Água', 'Pontos'],
      ...checkins.map((c) => [
        c.date,
        c.user.name,
        c.sugar_free ? 'Sim' : 'Não',
        c.low_carb ? 'Sim' : 'Não',
        c.exercised ? 'Sim' : 'Não',
        c.drank_water ? 'Sim' : 'Não',
        c.points_earned,
      ]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `familia-saude-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pt-2">
        <Shield className="w-5 h-5 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">Admin</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-sm">
        {(['challenges', 'users', 'history'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 font-semibold rounded-lg transition-all',
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            )}
          >
            {t === 'challenges' ? 'Desafios' : t === 'users' ? 'Usuários' : 'Histórico'}
          </button>
        ))}
      </div>

      {/* CHALLENGES TAB */}
      {tab === 'challenges' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-brand-500" /> Novo Desafio
            </h2>
            <input className={inputCls} placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea className={cn(inputCls, 'resize-none h-20')} placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Início</label>
                <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fim</label>
                <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Pontos de recompensa</label>
              <input type="number" className={inputCls} value={rewardPts} onChange={(e) => setRewardPts(e.target.value)} />
            </div>
            <button
              onClick={createChallenge}
              disabled={saving}
              className="w-full py-3 font-bold rounded-xl text-base disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #2ECC8A)', color: '#fff', boxShadow: '0 4px 16px rgba(29,158,117,0.3)' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Criar Desafio 🏆
            </button>
          </div>

          <div className="space-y-2">
            {challenges.map((ch) => (
              <div key={ch.id} className="bg-white rounded-xl border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{ch.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ch.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDateBR(ch.start_date)} – {formatDateBR(ch.end_date)}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-50 text-yellow-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    {ch.reward_points} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <h2 className="font-semibold text-gray-900">Ajustar Pontos</h2>
            <select
              className={inputCls}
              value={adjustUserId}
              onChange={(e) => setAdjustUserId(e.target.value)}
            >
              <option value="">Selecionar usuário…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({pointsAll.find((p) => p.user_id === u.id)?.total_points ?? 0} pts)
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Ex: +50 ou -20"
              className={inputCls}
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
            />
            <button
              onClick={adjustPoints}
              disabled={adjusting || !adjustUserId || !adjustAmount}
              className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {adjusting ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Aplicar Ajuste
            </button>
          </div>

          <div className="space-y-2">
            {users.map((u) => {
              const pts = pointsAll.find((p) => p.user_id === u.id)
              return (
                <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900">{u.name}</p>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{pts?.total_points ?? 0} pts</p>
                    <p className="text-[10px] text-gray-400">{pts?.monthly_points ?? 0} este mês</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <div className="space-y-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold w-full justify-center text-white"
            style={{ background: '#1D9E75' }}
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>

          <div className="space-y-1.5">
            {checkins.slice(0, 50).map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{c.user.name}</p>
                  <p className="text-[10px] text-gray-400">{formatDateBR(c.date)}</p>
                </div>
                <div className="flex gap-1 text-sm">
                  <span title="Sem açúcar" className={c.sugar_free ? 'opacity-100' : 'opacity-20'}>🚫🍬</span>
                  <span title="Low carb" className={c.low_carb ? 'opacity-100' : 'opacity-20'}>🥗</span>
                  <span title="Exercício" className={c.exercised ? 'opacity-100' : 'opacity-20'}>🏃</span>
                  <span title="Água" className={c.drank_water ? 'opacity-100' : 'opacity-20'}>💧</span>
                </div>
                <span className="text-xs font-bold text-brand-600 flex-shrink-0">{c.points_earned} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 bg-white'
