import {
  BarChart2,
  Calendar,
  MessageSquareReply,
  Send,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cardClass } from '../dashboardTheme'

interface ScorecardProps {
  label: string
  value: ReactNode
  subtext?: string
  icon: LucideIcon
  iconClassName?: string
}

function Scorecard({
  label,
  value,
  subtext,
  icon: Icon,
  iconClassName = 'text-teal-600',
}: ScorecardProps) {
  return (
    <div className={`${cardClass} flex flex-col items-center text-center`}>
      <div className="mb-2 rounded-lg bg-teal-50 p-2">
        <Icon className={`h-4 w-4 ${iconClassName}`} strokeWidth={2} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-[#1e293b]">{value}</div>
      {subtext && (
        <p className="mt-2 text-xs text-slate-400">{subtext}</p>
      )}
    </div>
  )
}

interface ScorecardsProps {
  applications: number
  avgPerDay: number
  recruiterOutreach: number
  responses: number
  mostActiveDay: string | null
  rangeLabel: string
}

export default function Scorecards({
  applications,
  avgPerDay,
  recruiterOutreach,
  responses,
  mostActiveDay,
  rangeLabel,
}: ScorecardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Scorecard
        label="Applications"
        value={
          <p className="text-3xl font-bold tracking-tight">{applications}</p>
        }
        subtext={rangeLabel}
        icon={BarChart2}
      />
      <Scorecard
        label="Average per day"
        value={
          <p className="text-3xl font-bold tracking-tight">
            {avgPerDay.toFixed(1)}
          </p>
        }
        subtext={rangeLabel}
        icon={TrendingUp}
      />
      <Scorecard
        label="Recruiter outreach"
        value={
          <p className="text-3xl font-bold tracking-tight">
            {recruiterOutreach}
          </p>
        }
        subtext={rangeLabel}
        icon={Send}
      />
      <Scorecard
        label="Responses"
        value={
          <p className="text-3xl font-bold tracking-tight">{responses}</p>
        }
        subtext={rangeLabel}
        icon={MessageSquareReply}
      />
      <Scorecard
        label="Most active day of the week"
        value={
          <p className="text-2xl font-bold tracking-tight">
            {mostActiveDay ?? '—'}
          </p>
        }
        subtext={rangeLabel}
        icon={Calendar}
      />
    </div>
  )
}
