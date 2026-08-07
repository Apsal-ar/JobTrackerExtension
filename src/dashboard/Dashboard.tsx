import { differenceInCalendarDays, format, subDays } from 'date-fns'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Application, RangePreset } from '../lib/applicationTypes'
import {
  applicationsPerDayData,
  averagePerDay,
  countIdsInDateRange,
  cvBreakdownData,
  earliestAppliedDate,
  filterByDateRange,
  getDateRange,
  heatmapData,
  mostActiveWeekday,
  sourceBreakdownData,
} from '../lib/dashboardUtils'
import type { Interview } from '../lib/interviewTypes'
import type { RecruiterOutreach } from '../lib/outreachTypes'
import { supabase } from '../lib/supabaseClient'
import ApplicationsPerDayChart from './components/ApplicationsPerDayChart'
import ApplicationsTable from './components/ApplicationsTable'
import ContributionHeatmap from './components/ContributionHeatmap'
import CvBreakdownChart from './components/CvBreakdownChart'
import DateRangeControl from './components/DateRangeControl'
import NextEventsTable, { toNextEventRows } from './components/NextEventsTable'
import OutreachModal from './components/OutreachModal'
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
  const [interviews, setInterviews] = useState<
    Pick<
      Interview,
      | 'id'
      | 'application_id'
      | 'interview_date'
      | 'interviewer_name'
      | 'interview_stage'
    >[]
  >([])
  const [outreach, setOutreach] = useState<
    Pick<RecruiterOutreach, 'id' | 'contact_date'>[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOutreachModal, setShowOutreachModal] = useState(false)
  const [preset, setPreset] = useState<RangePreset>('last7')
  const [customStart, setCustomStart] = useState(
    format(subDays(new Date(), 6), 'yyyy-MM-dd'),
  )
  const [customEnd, setCustomEnd] = useState(todayISO())

  async function loadInterviews() {
    const { data, error: interviewsError } = await supabase
      .from('interviews')
      .select(
        'id, application_id, interview_date, interviewer_name, interview_stage',
      )

    if (interviewsError) {
      setError(interviewsError.message)
      setInterviews([])
      return
    }

    setInterviews(
      (data as Pick<
        Interview,
        | 'id'
        | 'application_id'
        | 'interview_date'
        | 'interviewer_name'
        | 'interview_stage'
      >[]) ?? [],
    )
  }

  async function loadOutreach() {
    const { data, error: outreachError } = await supabase
      .from('recruiter_outreach')
      .select('id, contact_date')

    if (outreachError) {
      setError(outreachError.message)
      setOutreach([])
      return
    }

    setOutreach(
      (data as Pick<RecruiterOutreach, 'id' | 'contact_date'>[]) ?? [],
    )
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const [appsResult, interviewsResult, outreachResult] = await Promise.all([
        supabase
          .from('applications')
          .select(
            'id, company, job_title, url, source, applied_date, cv_used, effort_level',
          )
          .order('applied_date', { ascending: false }),
        supabase
          .from('interviews')
          .select(
            'id, application_id, interview_date, interviewer_name, interview_stage',
          ),
        supabase.from('recruiter_outreach').select('id, contact_date'),
      ])

      if (appsResult.error) {
        setError(appsResult.error.message)
        setApplications([])
        setInterviews([])
        setOutreach([])
      } else {
        setApplications((appsResult.data as Application[]) ?? [])
        setInterviews(
          (interviewsResult.data as Pick<
            Interview,
            | 'id'
            | 'application_id'
            | 'interview_date'
            | 'interviewer_name'
            | 'interview_stage'
          >[]) ?? [],
        )
        if (outreachResult.error) {
          setError(outreachResult.error.message)
          setOutreach([])
        } else {
          setOutreach(
            (outreachResult.data as Pick<
              RecruiterOutreach,
              'id' | 'contact_date'
            >[]) ?? [],
          )
        }
      }

      setLoading(false)
    }

    load()
  }, [])

  const dateRange = useMemo(
    () =>
      getDateRange(
        preset,
        customStart,
        customEnd,
        earliestAppliedDate(applications),
      ),
    [preset, customStart, customEnd, applications],
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

  const heatmapCounts = useMemo(
    () => heatmapData(applications),
    [applications],
  )

  const nextEvents = useMemo(() => {
    const companyByAppId = new Map(
      applications.map((app) => [app.id, app.company] as const),
    )
    return toNextEventRows(interviews, companyByAppId, todayISO())
  }, [applications, interviews])

  const scorecardStats = useMemo(
    () => ({
      applications: filteredApplications.length,
      avgPerDay: averagePerDay(filteredApplications, dateRange),
      recruiterOutreach: countIdsInDateRange(
        outreach.map((row) => ({ id: row.id, date: row.contact_date })),
        dateRange,
      ),
      responses: countIdsInDateRange(
        interviews.map((row) => ({ id: row.id, date: row.interview_date })),
        dateRange,
      ),
      mostActiveDay: mostActiveWeekday(filteredApplications),
    }),
    [filteredApplications, dateRange, outreach, interviews],
  )

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
        <div className="space-y-4">
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
          <div className="flex flex-col gap-3 sm:items-end">
            <DateRangeControl
              preset={preset}
              customStart={customStart}
              customEnd={customEnd}
              onPresetChange={setPreset}
              onCustomStartChange={setCustomStart}
              onCustomEndChange={setCustomEnd}
            />
            <button
              type="button"
              onClick={() => setShowOutreachModal(true)}
              className="inline-flex items-center justify-center self-end rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
            >
              Log recruiter outreach
            </button>
          </div>
          </header>

          <Scorecards
            applications={scorecardStats.applications}
            avgPerDay={scorecardStats.avgPerDay}
            recruiterOutreach={scorecardStats.recruiterOutreach}
            responses={scorecardStats.responses}
            mostActiveDay={scorecardStats.mostActiveDay}
            rangeLabel={dateRange.label}
          />
        </div>

        {showOutreachModal && (
          <OutreachModal
            applications={applications}
            onClose={() => setShowOutreachModal(false)}
            onSaved={() => {
              void loadOutreach()
            }}
          />
        )}

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

        <div className="grid gap-6 lg:grid-cols-2">
          {sectionCard(
            'Application activity',
            <ContributionHeatmap counts={heatmapCounts} />,
          )}
          {sectionCard(
            'Next events',
            <NextEventsTable
              events={nextEvents}
              onUpdated={() => {
                void loadInterviews()
              }}
            />,
          )}
        </div>

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
