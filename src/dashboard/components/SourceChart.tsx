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

interface SourceChartProps {
  data: { source: string; count: number }[]
}

function truncateLabel(label: string, max = 32): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

export default function SourceChart({ data }: SourceChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        No source data in this range.
      </p>
    )
  }

  const chartData = data.slice(0, 10).map((item) => ({
    ...item,
    displaySource: truncateLabel(item.source),
  }))

  const longestLabel = Math.max(
    ...chartData.map((item) => item.displaySource.length),
  )
  const yAxisWidth = Math.min(220, Math.max(100, longestLabel * 6.5))

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 36)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={chartGridStroke}
          horizontal={false}
        />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={chartAxisTick}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="displaySource"
          width={yAxisWidth}
          tick={chartAxisTick}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          {...chartTooltipStyle}
          formatter={(value) => [value, 'Applications']}
          labelFormatter={(_, payload) => {
            const entry = payload?.[0]?.payload as
              | { source: string }
              | undefined
            return entry?.source ?? ''
          }}
          cursor={{ fill: 'rgba(20, 184, 166, 0.08)' }}
        />
        <Bar
          dataKey="count"
          fill="#14b8a6"
          radius={[0, 6, 6, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
