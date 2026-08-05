import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfWeek,
  subDays,
} from 'date-fns'
import type { Application, DateRange, RangePreset } from './applicationTypes'

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function earliestAppliedDate(
  applications: Application[],
): string | null {
  const dates = applications
    .map((a) => a.applied_date)
    .filter((d): d is string => Boolean(d))
    .sort()
  return dates[0] ?? null
}

export function getDateRange(
  preset: RangePreset,
  customStart?: string,
  customEnd?: string,
  earliestDate?: string | null,
): DateRange {
  const today = startOfToday()

  if (preset === 'last7') {
    return {
      start: subDays(today, 6),
      end: today,
      label: 'Last 7 days',
    }
  }

  if (preset === 'lastMonth') {
    return {
      start: subDays(today, 30),
      end: today,
      label: 'Last month',
    }
  }

  if (preset === 'allTime') {
    const start = earliestDate ? parseISO(earliestDate) : today
    return {
      start,
      end: today,
      label: 'All time',
    }
  }

  const start = customStart ? parseISO(customStart) : today
  const end = customEnd ? parseISO(customEnd) : today
  const [rangeStart, rangeEnd] = start <= end ? [start, end] : [end, start]

  return {
    start: rangeStart,
    end: rangeEnd,
    label: `${format(rangeStart, 'd MMM yyyy')} – ${format(rangeEnd, 'd MMM yyyy')}`,
  }
}

export function filterByDateRange(
  applications: Application[],
  range: DateRange,
): Application[] {
  return applications.filter((app) => {
    if (!app.applied_date) return false
    const date = parseISO(app.applied_date)
    return isWithinInterval(date, { start: range.start, end: range.end })
  })
}

export function daySpan(range: DateRange): number {
  return differenceInCalendarDays(range.end, range.start) + 1
}

export function averagePerDay(
  applications: Application[],
  range: DateRange,
): number {
  const days = daySpan(range)
  if (days <= 0) return 0
  return applications.length / days
}

export function mostActiveWeekday(applications: Application[]): string | null {
  const counts = new Array(7).fill(0)

  for (const app of applications) {
    if (!app.applied_date) continue
    counts[parseISO(app.applied_date).getDay()]++
  }

  const max = Math.max(...counts)
  if (max === 0) return null

  return WEEKDAY_NAMES[counts.indexOf(max)]
}

/** Count distinct record ids whose date falls within the selected range. */
export function countIdsInDateRange(
  records: { id: string; date: string | null }[],
  range: DateRange,
): number {
  const ids = new Set<string>()

  for (const record of records) {
    if (!record.date) continue
    const date = parseISO(record.date)
    if (isWithinInterval(date, { start: range.start, end: range.end })) {
      ids.add(record.id)
    }
  }

  return ids.size
}

export function applicationsPerDayData(
  applications: Application[],
  range: DateRange,
): { label: string; count: number; date: string }[] {
  const days = daySpan(range)
  const useWeekly = days > 56

  if (useWeekly) {
    const weeks = eachWeekOfInterval(
      { start: range.start, end: range.end },
      { weekStartsOn: 1 },
    )

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      const count = applications.filter((app) => {
        if (!app.applied_date) return false
        const date = parseISO(app.applied_date)
        return isWithinInterval(date, {
          start: weekStart,
          end: weekEnd < range.end ? weekEnd : range.end,
        })
      }).length

      return {
        label: format(weekStart, 'd MMM'),
        count,
        date: format(weekStart, 'yyyy-MM-dd'),
      }
    })
  }

  return eachDayOfInterval({ start: range.start, end: range.end }).map(
    (day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const count = applications.filter(
        (app) => app.applied_date === dateStr,
      ).length

      return {
        label: format(day, days <= 14 ? 'EEE d' : 'd MMM'),
        count,
        date: dateStr,
      }
    },
  )
}

export function cvBreakdownData(
  applications: Application[],
): { name: string; value: number }[] {
  const counts = new Map<string, number>()

  for (const app of applications) {
    const key = app.cv_used?.trim() || 'Unspecified'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function sourceBreakdownData(
  applications: Application[],
): { source: string; count: number }[] {
  const counts = new Map<string, number>()

  for (const app of applications) {
    const key = app.source?.trim() || 'Unknown'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}

export function heatmapData(applications: Application[]): Map<string, number> {
  const counts = new Map<string, number>()

  for (const app of applications) {
    if (!app.applied_date) continue
    counts.set(app.applied_date, (counts.get(app.applied_date) ?? 0) + 1)
  }

  return counts
}

export function buildYearHeatmapDays(year: number): Date[] {
  const start = new Date(year, 0, 1)
  const end = new Date(year, 11, 31)
  const gridStart = startOfWeek(start, { weekStartsOn: 0 })
  const gridEnd = endOfWeek(end, { weekStartsOn: 0 })

  const days: Date[] = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }

  return days
}

export function formatEffortLevel(level: string | null): string {
  if (!level) return '—'
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export const CHART_COLORS = [
  '#0d9488',
  '#14b8a6',
  '#2dd4bf',
  '#5eead4',
  '#0f766e',
  '#115e59',
  '#134e4a',
  '#99f6e4',
]
