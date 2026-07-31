import {
  BarChart2,
  Calendar,
  CalendarDays,
  Flame,
  TrendingUp,
  Trophy,
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
  total: number
  last7Days: number
  thisMonth: number
  avgPerDay: number
  currentStreak: number
  longestStreak: number
  mostActiveDay: string | null
}

export default function Scorecards({
  total,
  last7Days,
  thisMonth,
  avgPerDay,
  currentStreak,
  longestStreak,
  mostActiveDay,
}: ScorecardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Scorecard
        label="Total applications"
        value={
          <p className="text-3xl font-bold tracking-tight">{total}</p>
        }
        icon={BarChart2}
      />
      <Scorecard
        label="Last 7 days"
        value={
          <p className="text-3xl font-bold tracking-tight">{last7Days}</p>
        }
        icon={CalendarDays}
      />
      <Scorecard
        label="This month"
        value={
          <p className="text-3xl font-bold tracking-tight">{thisMonth}</p>
        }
        icon={Calendar}
      />
      <Scorecard
        label="Avg per day"
        value={
          <p className="text-3xl font-bold tracking-tight">
            {avgPerDay.toFixed(1)}
          </p>
        }
        subtext="All-time average"
        icon={TrendingUp}
      />
      <Scorecard
        label="Streak"
        value={
          <div className="space-y-1.5 text-sm font-semibold text-[#1e293b]">
            <p className="flex items-center justify-center gap-1.5">
              <Flame className="h-4 w-4 shrink-0 text-orange-500" />
              <span>
                Current:{' '}
                <span className="text-lg font-bold">{currentStreak}</span> days
              </span>
            </p>
            <p className="flex items-center justify-center gap-1.5">
              <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
              <span>
                Longest:{' '}
                <span className="text-lg font-bold">{longestStreak}</span> days
              </span>
            </p>
          </div>
        }
        icon={Flame}
        iconClassName="text-orange-500"
      />
      <Scorecard
        label="Most active day"
        value={
          <p className="text-2xl font-bold tracking-tight">
            {mostActiveDay ?? '—'}
          </p>
        }
        subtext="All-time weekday"
        icon={Calendar}
      />
    </div>
  )
}
