import { format, getMonth, getYear } from 'date-fns'
import { buildYearHeatmapDays } from '../../lib/dashboardUtils'

interface ContributionHeatmapProps {
  counts: Map<string, number>
}

function intensityClass(count: number, max: number): string {
  if (count === 0 || max === 0) return 'bg-slate-100'
  const ratio = count / max
  if (ratio <= 0.25) return 'bg-teal-300'
  if (ratio <= 0.5) return 'bg-teal-500'
  if (ratio <= 0.75) return 'bg-teal-700'
  return 'bg-teal-900'
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export default function ContributionHeatmap({ counts }: ContributionHeatmapProps) {
  const year = getYear(new Date())
  const days = buildYearHeatmapDays(year)
  const max = Math.max(0, ...counts.values())

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const monthLabels: { weekIndex: number; label: string }[] = []
  let lastMonth = -1
  weeks.forEach((week, weekIndex) => {
    const firstInYear = week.find((day) => day.getFullYear() === year)
    if (!firstInYear) return
    const month = getMonth(firstInYear)
    if (month !== lastMonth) {
      monthLabels.push({ weekIndex, label: format(firstInYear, 'MMM') })
      lastMonth = month
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{year} activity</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Less</span>
          <span className="h-[10px] w-[10px] rounded-[2px] bg-slate-100" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-teal-300" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-teal-500" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-teal-700" />
          <span className="h-[10px] w-[10px] rounded-[2px] bg-teal-900" />
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-[3px] pt-[18px]">
          {DAY_LABELS.map((label, index) => (
            <div
              key={index}
              className="flex h-[10px] items-center text-[10px] leading-none text-slate-400"
            >
              {label}
            </div>
          ))}
        </div>

        <div>
          <div className="relative mb-1 flex gap-[3px]" style={{ height: 14 }}>
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${weekIndex}-${label}`}
                className="absolute text-[10px] font-medium text-slate-400"
                style={{ left: weekIndex * 13 }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const count = counts.get(dateStr) ?? 0
                  const inYear = day.getFullYear() === year

                  return (
                    <div
                      key={dateStr}
                      title={
                        inYear
                          ? `${format(day, 'd MMM yyyy')}: ${count} application${count === 1 ? '' : 's'}`
                          : undefined
                      }
                      className={`h-[10px] w-[10px] rounded-[2px] ${
                        inYear ? intensityClass(count, max) : 'bg-transparent'
                      }`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
