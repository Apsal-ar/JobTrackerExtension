import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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

function yAxisTicks(max: number): number[] {
  if (max <= 1) return [0, 1]
  if (max <= 5) return Array.from({ length: max + 1 }, (_, i) => i)

  const step = Math.max(1, Math.ceil(max / 4))
  const ticks: number[] = []
  for (let value = 0; value < max; value += step) {
    ticks.push(value)
  }
  if (ticks[ticks.length - 1] !== max) ticks.push(max)
  return ticks
}

export default function ApplicationsPerDayChart({
  data,
  weekly,
}: ApplicationsPerDayChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-500">
        No applications in this range.
      </p>
    )
  }

  const maxCount = Math.max(0, ...data.map((d) => d.count))
  const yMax = Math.max(1, maxCount)

  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart
        data={data}
        margin={{ top: 28, right: 16, left: 8, bottom: 28 }}
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
          label={{
            value: weekly ? 'Week' : 'Date',
            position: 'insideBottom',
            offset: -16,
            style: { fill: '#64748b', fontSize: 12, fontWeight: 500 },
          }}
        />
        <YAxis
          domain={[0, yMax]}
          ticks={yAxisTicks(yMax)}
          allowDecimals={false}
          tick={chartAxisTick}
          axisLine={false}
          tickLine={false}
          width={52}
          label={{
            value: 'Applications',
            angle: -90,
            position: 'insideLeft',
            offset: 10,
            style: {
              fill: '#64748b',
              fontSize: 12,
              fontWeight: 500,
              textAnchor: 'middle',
            },
          }}
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
        >
          <LabelList
            dataKey="count"
            position="top"
            formatter={(value) => {
              const count = typeof value === 'number' ? value : Number(value)
              return count > 0 ? String(count) : ''
            }}
            style={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
