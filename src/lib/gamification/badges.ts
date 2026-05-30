import type { BadgeType, DailyCheckin, Streak, WeightLog } from '@/types'

interface BadgeCheckInput {
  existingBadges: BadgeType[]
  streak: Streak
  checkins: DailyCheckin[]
  weightLogs: WeightLog[]
}

export function computeNewBadges(input: BadgeCheckInput): BadgeType[] {
  const { existingBadges, streak, checkins, weightLogs } = input
  const newBadges: BadgeType[] = []

  function hasAlready(b: BadgeType) {
    return existingBadges.includes(b)
  }

  function award(b: BadgeType) {
    if (!hasAlready(b)) newBadges.push(b)
  }

  // First Step
  if (checkins.length >= 1) award('first_step')

  // Week Warrior — 7-day streak
  if (streak.current_streak >= 7) award('week_warrior')

  // Iron Will — 30-day streak
  if (streak.current_streak >= 30) award('iron_will')

  // Sugar Crusher — 7 consecutive sugar-free days
  if (!hasAlready('sugar_crusher')) {
    const sorted = [...checkins].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    let consecutive = 0
    for (const c of sorted) {
      if (c.sugar_free) consecutive++
      else break
    }
    if (consecutive >= 7) award('sugar_crusher')
  }

  // Transformation — lost > 5% of starting weight
  if (!hasAlready('transformation') && weightLogs.length >= 2) {
    const sorted = [...weightLogs].sort(
      (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
    )
    const starting = sorted[0].weight_kg
    const latest = sorted[sorted.length - 1].weight_kg
    const pctLoss = ((starting - latest) / starting) * 100
    if (pctLoss >= 5) award('transformation')
  }

  // Hydration Hero — 14 consecutive water days
  if (!hasAlready('hydration_hero')) {
    const sorted = [...checkins].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    let consecutive = 0
    for (const c of sorted) {
      if (c.drank_water) consecutive++
      else break
    }
    if (consecutive >= 14) award('hydration_hero')
  }

  // Exercise Enthusiast — 21 exercise days in a calendar month
  if (!hasAlready('exercise_enthusiast')) {
    const now = new Date()
    const thisMonth = checkins.filter((c) => {
      const d = new Date(c.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const exerciseDays = thisMonth.filter((c) => c.exercised).length
    if (exerciseDays >= 21) award('exercise_enthusiast')
  }

  return newBadges
}
