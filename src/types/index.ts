import type { Database } from './database'

export type User = Database['public']['Tables']['users']['Row']
export type DailyCheckin = Database['public']['Tables']['daily_checkins']['Row']
export type WeightLog = Database['public']['Tables']['weight_logs']['Row']
export type Measurement = Database['public']['Tables']['measurements']['Row']
export type Checkup = Database['public']['Tables']['checkups']['Row']
export type Streak = Database['public']['Tables']['streaks']['Row']
export type Points = Database['public']['Tables']['points']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']
export type WeeklyChallenge = Database['public']['Tables']['weekly_challenges']['Row']
export type ChallengeCompletion = Database['public']['Tables']['challenge_completions']['Row']
export type ActivityFeedItem = Database['public']['Tables']['activity_feed']['Row']

export type BadgeType =
  | 'first_step'
  | 'week_warrior'
  | 'sugar_crusher'
  | 'iron_will'
  | 'transformation'
  | 'hydration_hero'
  | 'exercise_enthusiast'

export interface BadgeDefinition {
  type: BadgeType
  label: string
  description: string
  icon: string
  color: string
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: 'first_step',
    label: 'Primeiro Passo',
    description: 'Fez o primeiro check-in',
    icon: '🌱',
    color: 'bg-green-100 text-green-700',
  },
  {
    type: 'week_warrior',
    label: 'Guerreiro Semanal',
    description: '7 dias consecutivos de check-in',
    icon: '⚔️',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    type: 'sugar_crusher',
    label: 'Esmaga-Açúcar',
    description: '7 dias consecutivos sem açúcar',
    icon: '🚫🍬',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    type: 'iron_will',
    label: 'Vontade de Ferro',
    description: '30 dias consecutivos de check-in',
    icon: '💪',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    type: 'transformation',
    label: 'Transformação',
    description: 'Perdeu mais de 5% do peso inicial',
    icon: '🦋',
    color: 'bg-pink-100 text-pink-700',
  },
  {
    type: 'hydration_hero',
    label: 'Herói da Hidratação',
    description: '14 dias consecutivos bebendo 2L de água',
    icon: '💧',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    type: 'exercise_enthusiast',
    label: 'Entusiasta do Exercício',
    description: '21 dias de exercício no mês',
    icon: '🏃',
    color: 'bg-yellow-100 text-yellow-700',
  },
]

export interface LeaderboardEntry {
  user: User
  streak: Streak
  points: Points
  weightChangePct: number | null
}

export interface CheckinForm {
  sugar_free: boolean
  low_carb: boolean
  exercised: boolean
  drank_water: boolean
}

export type ProgramPhase = 1 | 2 | 3

export interface PhaseInfo {
  phase: ProgramPhase
  label: string
  description: string
  streakGoal: number
  monthsRange: string
  color: string
}
