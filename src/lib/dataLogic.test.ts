import { describe, expect, it } from 'vitest'
import type { Application } from './applicationTypes'
import {
  appliedDateString,
  parseAppliedDate,
  startOfCalendarDay,
} from './appliedDate'
import {
  averagePerDay,
  daySpan,
  filterByDateRange,
  getDateRange,
  mostActiveWeekday,
} from './dashboardUtils'
import {
  currentApplicationStreak,
  longestApplicationStreak,
} from './streakUtils'
import {
  isDuplicateApplicationUrl,
  normalizeApplicationUrl,
} from './urlUtils'

function makeApp(id: string, applied_date: string): Application {
  return {
    id,
    company: null,
    job_title: null,
    url: null,
    source: null,
    applied_date,
    cv_used: null,
    effort_level: null,
  }
}

const MOCK_TODAY = startOfCalendarDay(new Date(2026, 7, 8))

describe('streak calculation', () => {
  it('counts consecutive dates as one streak', () => {
    const dates = ['2026-08-06', '2026-08-07', '2026-08-08']

    expect(longestApplicationStreak(dates)).toBe(3)
    expect(currentApplicationStreak(dates, MOCK_TODAY)).toBe(3)
  })

  it('resets after a gap in dates', () => {
    const dates = ['2026-08-01', '2026-08-02', '2026-08-08']

    expect(longestApplicationStreak(dates)).toBe(2)
    expect(currentApplicationStreak(dates, MOCK_TODAY)).toBe(1)
  })

  it('returns 1 for a single day of data', () => {
    const dates = ['2026-08-08']

    expect(longestApplicationStreak(dates)).toBe(1)
    expect(currentApplicationStreak(dates, MOCK_TODAY)).toBe(1)
  })

  it('returns 0 when there is no data', () => {
    expect(longestApplicationStreak([])).toBe(0)
    expect(currentApplicationStreak([], MOCK_TODAY)).toBe(0)
  })

  it('counts yesterday when today has no application yet (grace until end of today)', () => {
    const dates = ['2026-08-06', '2026-08-07']

    expect(currentApplicationStreak(dates, MOCK_TODAY)).toBe(2)
  })

  it('returns 0 when the latest application is before yesterday', () => {
    const dates = ['2026-08-05']

    expect(currentApplicationStreak(dates, MOCK_TODAY)).toBe(0)
  })
})

describe('mostActiveWeekday', () => {
  it('returns the weekday with the clear majority', () => {
    const apps = [
      makeApp('1', '2026-08-03'),
      makeApp('2', '2026-07-27'),
      makeApp('3', '2026-07-20'),
      makeApp('4', '2026-07-13'),
      makeApp('5', '2026-07-06'),
      makeApp('6', '2026-08-04'),
    ]

    expect(mostActiveWeekday(apps)).toBe('Monday')
  })

  it('breaks ties by earliest weekday in calendar order (Sunday first)', () => {
    const apps = [
      makeApp('1', '2026-08-02'),
      makeApp('2', '2026-08-03'),
      makeApp('3', '2026-08-09'),
      makeApp('4', '2026-08-10'),
    ]

    expect(mostActiveWeekday(apps)).toBe('Sunday')
  })

  it('returns null when there is no data', () => {
    expect(mostActiveWeekday([])).toBeNull()
    expect(mostActiveWeekday([makeApp('1', null as unknown as string)])).toBeNull()
  })
})

describe('averagePerDay (all-time range)', () => {
  it('divides by inclusive days since first application', () => {
    const apps = [
      makeApp('1', '2026-08-06'),
      makeApp('2', '2026-08-08'),
      makeApp('3', '2026-08-08'),
    ]
    const range = getDateRange(
      'allTime',
      undefined,
      undefined,
      '2026-08-06',
      MOCK_TODAY,
    )

    expect(daySpan(range)).toBe(3)
    expect(averagePerDay(apps, range)).toBe(1)
  })

  it('uses a single-day denominator when all applications share one date', () => {
    const apps = [
      makeApp('1', '2026-08-08'),
      makeApp('2', '2026-08-08'),
      makeApp('3', '2026-08-08'),
    ]
    const range = getDateRange(
      'allTime',
      undefined,
      undefined,
      '2026-08-08',
      MOCK_TODAY,
    )

    expect(daySpan(range)).toBe(1)
    expect(averagePerDay(apps, range)).toBe(3)
  })
})

describe('duplicate URL detection', () => {
  const base = 'https://Example.com/jobs/123'

  it('identifies an exact URL match', () => {
    expect(isDuplicateApplicationUrl(base, base)).toBe(true)
  })

  it('does not flag a different URL as duplicate', () => {
    expect(
      isDuplicateApplicationUrl(
        'https://example.com/jobs/123',
        'https://example.com/jobs/456',
      ),
    ).toBe(false)
  })

  it('treats host as case-insensitive while keeping path case-sensitive', () => {
    expect(
      isDuplicateApplicationUrl(
        'https://EXAMPLE.com/jobs/ABC',
        'https://example.com/jobs/ABC',
      ),
    ).toBe(true)
    expect(
      isDuplicateApplicationUrl(
        'https://example.com/jobs/ABC',
        'https://example.com/jobs/abc',
      ),
    ).toBe(false)
  })

  it('treats trailing slashes on the path as the same URL', () => {
    expect(
      isDuplicateApplicationUrl(
        'https://example.com/job',
        'https://example.com/job/',
      ),
    ).toBe(true)
    expect(normalizeApplicationUrl('https://example.com/job/')).toBe(
      'https://example.com/job',
    )
  })
})

describe('date-range filtering', () => {
  const apps = [
    makeApp('before', '2026-08-01'),
    makeApp('start', '2026-08-05'),
    makeApp('end', '2026-08-08'),
    makeApp('after', '2026-08-10'),
  ]

  it('last 7 days uses a 7-day inclusive window relative to mock today', () => {
    const range = getDateRange('last7', undefined, undefined, null, MOCK_TODAY)

    expect(appliedDateString(range.start)).toBe('2026-08-02')
    expect(appliedDateString(range.end)).toBe('2026-08-08')
    expect(daySpan(range)).toBe(7)

    const filtered = filterByDateRange(apps, range).map((app) => app.id)
    expect(filtered).toEqual(['start', 'end'])
  })

  it('last month preset uses a 30-day rolling window (UI label: Last month)', () => {
    const range = getDateRange(
      'lastMonth',
      undefined,
      undefined,
      null,
      MOCK_TODAY,
    )

    expect(appliedDateString(range.start)).toBe('2026-07-09')
    expect(appliedDateString(range.end)).toBe('2026-08-08')

    const filtered = filterByDateRange(apps, range).map((app) => app.id)
    expect(filtered).toEqual(['before', 'start', 'end'])
  })

  it('custom range includes both boundary dates and excludes outside dates', () => {
    const range = getDateRange(
      'custom',
      '2026-08-05',
      '2026-08-08',
      null,
      MOCK_TODAY,
    )

    const filtered = filterByDateRange(apps, range).map((app) => app.id)
    expect(filtered).toEqual(['start', 'end'])
  })

  it('parseAppliedDate keeps calendar dates stable (no timezone day shift)', () => {
    const parsed = parseAppliedDate('2026-06-15')

    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(5)
    expect(parsed.getDate()).toBe(15)

    const range = getDateRange('custom', '2026-06-15', '2026-06-15', null)
    const juneApp = makeApp('june', '2026-06-15')

    expect(filterByDateRange([juneApp], range).map((app) => app.id)).toEqual([
      'june',
    ])
  })
})
