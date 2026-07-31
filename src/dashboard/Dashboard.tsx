import { differenceInCalendarDays, format, subDays } from 'date-fns'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Application, RangePreset } from '../lib/applicationTypes'
import {
  applicationsPerDayData,
  averagePerDayAllTime,
  computeStreaks,
  countInLast7Days,
  countThisMonth,
  cvBreakdownData,
  filterByDateRange,
  getDateRange,
  heatmapData,
  mostActiveWeekday,
  sourceBreakdownData,
} from '../lib/dashboardUtils'
import { supabase } from '../lib/supabaseClient'
import ApplicationsPerDayChart from './components/ApplicationsPerDayChart'
import ApplicationsTable from './components/ApplicationsTable'
import ContributionHeatmap from './components/ContributionHeatmap'
import CvBreakdownChart from './components/CvBreakdownChart'
import DateRangeControl from './components/DateRangeControl'
import Scorecards from './components/Scorecards'
import SourceChart from './components/SourceChart'
import {
  cardClass,
  headingClass,
  pageBg,
  sectionTitleClass,
  subheadingClass,
} from './dashboardTheme'

function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

function sectionCard(title: string, children: ReactNode) {
  return (
    <section className={cardClass}>
      <h2 className={sectionTitleClass}>{title}</h2>
      {children}
    </section>
  )
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [preset, setPreset] = useState<RangePreset>('last7')
  const [customStart, setCustomStart] = useState(
    format(subDays(new Date(), 6), 'yyyy-MM-dd'),
  )
  const [customEnd, setCustomEnd] = useState(todayISO())

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('applications')
        .select(
          'id, company, job_title, url, source, applied_date, cv_used, effort_level',
        )
        .order('applied_date', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        setApplications([])
      } else {
        setApplications((data as Application[]) ?? [])
      }

      setLoading(false)
    }

    load()
  }, [])

  const dateRange = useMemo(
    () => getDateRange(preset, customStart, customEnd),
    [preset, customStart, customEnd],
  )

  const filteredApplications = useMemo(() => {
    return filterByDateRange(applications, dateRange).sort((a, b) => {
      if (!a.applied_date) return 1
      if (!b.applied_date) return -1
      return b.applied_date.localeCompare(a.applied_date)
    })
  }, [applications, dateRange])

  const perDayData = useMemo(
    () => applicationsPerDayData(filteredApplications, dateRange),
    [filteredApplications, dateRange],
  )

  const isWeekly =
    differenceInCalendarDays(dateRange.end, dateRange.start) + 1 > 56

  const cvData = useMemo(
    () => cvBreakdownData(filteredApplications),
    [filteredApplications],
  )

  const sourceData = useMemo(
    () => sourceBreakdownData(filteredApplications),
    [filteredApplications],
  )

  const heatmapCounts = useMemo(() => heatmapData(applications), [applications])

  const streaks = useMemo(() => computeStreaks(applications), [applications])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${pageBg}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading applications…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${pageBg}`}>
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Failed to load data: {error}
        </p>
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className={`p-8 ${pageBg}`}>
        <div className="mx-auto max-w-lg text-center">
          <img
            src="/icons/icon128.png"
            alt=""
            className="mx-auto mb-6 h-16 w-16"
          />
          <h1 className={headingClass}>Job Application Tracker</h1>
          <p className="mt-4 text-slate-500">
            No applications logged yet. Use the extension popup on a job posting
            to save your first application.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/icons/icon48.png"
              alt=""
              className="h-12 w-12 rounded-xl shadow-sm ring-1 ring-slate-200/80"
            />
            <div>
              <h1 className={headingClass}>Job Application Tracker</h1>
              <p className={subheadingClass}>
                Overview of your job search activity
              </p>
            </div>
          </div>
          <DateRangeControl
            preset={preset}
            customStart={customStart}
            customEnd={customEnd}
            onPresetChange={setPreset}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
          />
        </header>

        <Scorecards
          total={applications.length}
          last7Days={countInLast7Days(applications)}
          thisMonth={countThisMonth(applications)}
          avgPerDay={averagePerDayAllTime(applications)}
          currentStreak={streaks.current}
          longestStreak={streaks.longest}
          mostActiveDay={mostActiveWeekday(applications)}
        />

        {sectionCard(
          `Applications per ${isWeekly ? 'week' : 'day'}`,
          <ApplicationsPerDayChart data={perDayData} weekly={isWeekly} />,
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {sectionCard('CV type breakdown', <CvBreakdownChart data={cvData} />)}
          {sectionCard(
            'Applications by source',
            <SourceChart data={sourceData} />,
          )}
        </div>

        {sectionCard(
          'Application activity',
          <ContributionHeatmap counts={heatmapCounts} />,
        )}

        {sectionCard(
          'Recent applications',
          <ApplicationsTable
            key={`${preset}-${customStart}-${customEnd}`}
            applications={filteredApplications}
            rangeLabel={dateRange.label}
          />,
        )}
      </div>
    </div>
  )
}
