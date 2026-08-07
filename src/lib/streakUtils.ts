import { differenceInCalendarDays, subDays } from 'date-fns'
import {
  appliedDateString,
  parseAppliedDate,
  startOfCalendarDay,
} from './appliedDate'

/**
 * Current streak: consecutive calendar days with at least one application,
 * counting backward from today. If today has no application yet, the streak
 * still includes yesterday (grace until end of today).
 */
export function currentApplicationStreak(
  appliedDates: string[],
  referenceToday: Date = startOfCalendarDay(new Date()),
): number {
  const activeDays = new Set(
    appliedDates.filter((date): date is string => Boolean(date)),
  )

  if (activeDays.size === 0) return 0

  const todayKey = appliedDateString(referenceToday)
  let cursor =
    activeDays.has(todayKey)
      ? referenceToday
      : subDays(referenceToday, 1)

  if (!activeDays.has(appliedDateString(cursor))) return 0

  let streak = 0

  while (activeDays.has(appliedDateString(cursor))) {
    streak++
    cursor = subDays(cursor, 1)
  }

  return streak
}

/** Longest run of consecutive calendar days with at least one application. */
export function longestApplicationStreak(appliedDates: string[]): number {
  const uniqueSorted = [...new Set(appliedDates.filter(Boolean))].sort()

  if (uniqueSorted.length === 0) return 0
  if (uniqueSorted.length === 1) return 1

  let longest = 1
  let current = 1

  for (let i = 1; i < uniqueSorted.length; i++) {
    const prev = parseAppliedDate(uniqueSorted[i - 1])
    const curr = parseAppliedDate(uniqueSorted[i])
    const gap = differenceInCalendarDays(curr, prev)

    if (gap === 1) {
      current++
    } else if (gap > 1) {
      longest = Math.max(longest, current)
      current = 1
    }
  }

  return Math.max(longest, current)
}
