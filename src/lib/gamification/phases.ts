import type { PhaseInfo, ProgramPhase } from '@/types'

export function getProgramPhase(userCreatedAt: string): PhaseInfo {
  const start = new Date(userCreatedAt)
  const now = new Date()
  const monthsElapsed =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth())

  // After 12 months a new cycle begins
  const cycleMonth = monthsElapsed % 12

  if (cycleMonth <= 1) {
    return {
      phase: 1,
      label: 'Fase 1 – Adaptação',
      description: 'Construindo o hábito. Meta: 5 check-ins por semana.',
      streakGoal: 5,
      monthsRange: 'Meses 1–2',
      color: 'bg-sky-100 text-sky-700',
    }
  }

  if (cycleMonth <= 3) {
    return {
      phase: 2,
      label: 'Fase 2 – Aceleração',
      description: 'Aumentando a intensidade. Meta: 6 check-ins por semana.',
      streakGoal: 6,
      monthsRange: 'Meses 3–4',
      color: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    phase: 3,
    label: 'Fase 3 – Consolidação',
    description: 'Modo elite. Meta: 7 check-ins por semana.',
    streakGoal: 7,
    monthsRange: 'Meses 5–6',
    color: 'bg-brand-100 text-brand-700',
  }
}
