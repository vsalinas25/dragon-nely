import type { CheckinForm } from '@/types'

export const POINTS = {
  sugar_free: 10,
  low_carb: 8,
  exercised: 10,
  drank_water: 5,
  all_four_bonus: 15,
  missed_day_penalty: 5,
} as const

export function calculateCheckinPoints(form: CheckinForm): number {
  let pts = 0
  let count = 0

  if (form.sugar_free)  { pts += POINTS.sugar_free;  count++ }
  if (form.low_carb)    { pts += POINTS.low_carb;    count++ }
  if (form.exercised)   { pts += POINTS.exercised;   count++ }
  if (form.drank_water) { pts += POINTS.drank_water; count++ }

  if (count === 4) pts += POINTS.all_four_bonus

  return pts
}

export const MAX_DAILY_POINTS = 10 + 8 + 10 + 5 + 15 // 48
