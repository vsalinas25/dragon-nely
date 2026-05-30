import { differenceInCalendarDays, parseISO } from 'date-fns'
import { todayInBrazil } from '@/lib/utils'

export function computeNewStreak(
  lastCheckinDate: string | null,
  currentStreak: number,
  longestStreak: number
): { current_streak: number; longest_streak: number; last_checkin_date: string } {
  const today = todayInBrazil()

  if (!lastCheckinDate) {
    return { current_streak: 1, longest_streak: Math.max(1, longestStreak), last_checkin_date: today }
  }

  const diff = differenceInCalendarDays(parseISO(today), parseISO(lastCheckinDate))

  let newStreak: number
  if (diff === 1) {
    // Consecutive day
    newStreak = currentStreak + 1
  } else if (diff === 0) {
    // Same day (shouldn't happen due to UNIQUE constraint, but guard it)
    newStreak = currentStreak
  } else {
    // Gap — reset
    newStreak = 1
  }

  return {
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, longestStreak),
    last_checkin_date: today,
  }
}
