import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  chartAxisTick,
  chartGridStroke,
  chartTooltipStyle,
} from '../dashboardTheme'

interface ApplicationsPerDayChartProps {
  data: { label: string; count: number }[]
  weekly: boolean
}

export default function ApplicationsPerDayChart({
  data,
}: ApplicationsPerDayChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        No applications in this range.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={data}
        margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartGridStroke}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={chartAxisTick}
          axisLine={false}
          tickLine={false}
          interval={data.length > 20 ? Math.floor(data.length / 10) : 0}
        />
        <YAxis
          allowDecimals={false}
          tick={chartAxisTick}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          {...chartTooltipStyle}
          formatter={(value) => [value, 'Applications']}
          cursor={{ fill: 'rgba(13, 148, 136, 0.08)' }}
        />
        <Bar
          dataKey="count"
          fill="#0d9488"
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
