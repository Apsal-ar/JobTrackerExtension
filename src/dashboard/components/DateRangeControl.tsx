import DatePicker, { datePickerInputClassName } from '../../components/DatePicker'
import type { RangePreset } from '../../lib/applicationTypes'

interface DateRangeControlProps {
  preset: RangePreset
  customStart: string
  customEnd: string
  onPresetChange: (preset: RangePreset) => void
  onCustomStartChange: (value: string) => void
  onCustomEndChange: (value: string) => void
}

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: 'last7', label: 'Last 7 days' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'allTime', label: 'All time' },
  { id: 'custom', label: 'Custom range' },
]

export default function DateRangeControl({
  preset,
  customStart,
  customEnd,
  onPresetChange,
  onCustomStartChange,
  onCustomEndChange,
}: DateRangeControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/80 p-1 shadow-inner">
        {PRESETS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onPresetChange(id)}
            className={`rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
              preset === id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-2">
          <DatePicker
            value={customStart}
            onChange={onCustomStartChange}
            className={datePickerInputClassName}
          />
          <span className="text-sm text-slate-400">to</span>
          <DatePicker
            value={customEnd}
            onChange={onCustomEndChange}
            className={datePickerInputClassName}
          />
        </div>
      )}
    </div>
  )
}
