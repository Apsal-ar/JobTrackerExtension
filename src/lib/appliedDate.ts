import { format } from 'date-fns'

/** Parse YYYY-MM-DD as a local calendar date (avoids UTC midnight shifts from parseISO). */
export function parseAppliedDate(dateStr: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) {
    throw new Error(`Invalid applied date: ${dateStr}`)
  }

  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )
}

export function appliedDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function startOfCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}
