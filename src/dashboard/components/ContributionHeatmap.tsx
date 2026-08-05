import { format, getMonth, getYear } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'
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
const GAP = 2
const DAY_LABEL_WIDTH = 28
const GRID_GAP = 8

export default function ContributionHeatmap({
  counts,
}: ContributionHeatmapProps) {
  const year = getYear(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(8)

  const { weeks, monthLabels, max } = useMemo(() => {
    const days = buildYearHeatmapDays(year)
    const weekChunks: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weekChunks.push(days.slice(i, i + 7))
    }

    const labels: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    weekChunks.forEach((week, weekIndex) => {
      const firstInYear = week.find((day) => day.getFullYear() === year)
      if (!firstInYear) return
      const month = getMonth(firstInYear)
      if (month !== lastMonth) {
        labels.push({ weekIndex, label: format(firstInYear, 'MMM') })
        lastMonth = month
      }
    })

    return {
      weeks: weekChunks,
      monthLabels: labels,
      max: Math.max(0, ...counts.values()),
    }
  }, [year, counts])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function updateSize() {
      if (!el) return
      const available =
        el.clientWidth - DAY_LABEL_WIDTH - GRID_GAP - GAP * (weeks.length - 1)
      const nextSize = Math.floor(available / weeks.length)
      setCellSize(Math.max(3, nextSize))
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [weeks.length])

  const legendSize = Math.min(10, Math.max(6, cellSize))
  const step = cellSize + GAP

  return (
    <div ref={containerRef} className="w-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">{year} activity</p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Less</span>
          <span
            className="rounded-[2px] bg-slate-100"
            style={{ width: legendSize, height: legendSize }}
          />
          <span
            className="rounded-[2px] bg-teal-300"
            style={{ width: legendSize, height: legendSize }}
          />
          <span
            className="rounded-[2px] bg-teal-500"
            style={{ width: legendSize, height: legendSize }}
          />
          <span
            className="rounded-[2px] bg-teal-700"
            style={{ width: legendSize, height: legendSize }}
          />
          <span
            className="rounded-[2px] bg-teal-900"
            style={{ width: legendSize, height: legendSize }}
          />
          <span>More</span>
        </div>
      </div>

      <div className="flex" style={{ gap: GRID_GAP }}>
        <div
          className="flex shrink-0 flex-col"
          style={{ width: DAY_LABEL_WIDTH, gap: GAP, paddingTop: 16 }}
        >
          {DAY_LABELS.map((label, index) => (
            <div
              key={index}
              className="flex items-center text-[10px] leading-none text-slate-400"
              style={{ height: cellSize }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative mb-1" style={{ height: 14 }}>
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${weekIndex}-${label}`}
                className="absolute text-[10px] font-medium text-slate-400"
                style={{ left: weekIndex * step }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex" style={{ gap: GAP }}>
            {weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="flex flex-col"
                style={{ gap: GAP }}
              >
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
                      className={`rounded-[2px] ${
                        inYear ? intensityClass(count, max) : 'bg-transparent'
                      }`}
                      style={{ width: cellSize, height: cellSize }}
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
