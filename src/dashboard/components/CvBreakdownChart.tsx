import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { CHART_COLORS } from '../../lib/dashboardUtils'
import { chartTooltipStyle } from '../dashboardTheme'

interface CvBreakdownChartProps {
  data: { name: string; value: number }[]
}

export default function CvBreakdownChart({ data }: CvBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        No CV data in this range.
      </p>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value, name) => {
                const num = typeof value === 'number' ? value : 0
                const pct = ((num / total) * 100).toFixed(1)
                return [`${num} (${pct}%)`, String(name)]
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#1e293b]">{total}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
        {data.map((item, index) => {
          const pct = ((item.value / total) * 100).toFixed(0)
          return (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 font-medium text-slate-500">
                {pct}%{' '}
                <span className="text-slate-400">({item.value})</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
