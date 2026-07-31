import { DayPicker, DayFlag, SelectionState, UI, getDefaultClassNames } from 'react-day-picker'
import { format, isValid, parseISO } from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

const triggerLayoutClassName =
  'flex w-full items-center justify-start gap-2 text-left'

const defaultAppearanceClassName =
  'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500'

const dayPickerClassNames = (() => {
  const defaults = getDefaultClassNames()
  return {
    ...defaults,
    [UI.Root]: `${defaults[UI.Root]} rounded-xl border border-slate-200 bg-white p-3 shadow-lg`,
    [UI.Months]: 'flex flex-col',
    [UI.Month]: 'space-y-3',
    [UI.MonthCaption]: 'relative flex items-center justify-center px-8',
    [UI.CaptionLabel]: 'text-sm font-semibold text-slate-800',
    [UI.Nav]: 'flex items-center',
    [UI.PreviousMonthButton]:
      'absolute left-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700',
    [UI.NextMonthButton]:
      'absolute right-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700',
    [UI.Weekdays]: 'flex',
    [UI.Weekday]:
      'w-9 text-center text-[0.7rem] font-medium uppercase tracking-wide text-slate-400',
    [UI.Week]: 'mt-1 flex w-full',
    [UI.Day]:
      'relative flex h-9 w-9 items-center justify-center p-0 text-center text-sm',
    [UI.DayButton]:
      'h-9 w-9 rounded-lg font-medium text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-800',
    [DayFlag.today]: 'font-semibold text-teal-700',
    [SelectionState.selected]:
      '[&>button]:bg-teal-600 [&>button]:text-white [&>button]:hover:bg-teal-700 [&>button]:hover:text-white',
    [DayFlag.outside]: 'text-slate-300 opacity-60',
    [DayFlag.disabled]: 'text-slate-300 opacity-40',
  }
})()

interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  popoverAlign?: 'start' | 'center'
}

function parseValue(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

export default function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  className,
  placeholder = 'Select date',
  popoverAlign = 'start',
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const selected = parseValue(value)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handlePointerDown)
    }

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`${triggerLayoutClassName} ${className ?? defaultAppearanceClassName}`}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-teal-600" />
        <span
          className={`shrink-0 ${selected ? 'text-slate-700' : 'text-slate-400'}`}
        >
          {selected ? format(selected, 'd MMM yyyy') : placeholder}
        </span>
      </button>

      {open && (
        <div
          id={listboxId}
          className={`absolute top-full z-50 mt-2 ${
            popoverAlign === 'center'
              ? 'left-1/2 -translate-x-1/2'
              : 'left-0'
          }`}
          role="dialog"
          aria-label="Choose date"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'yyyy-MM-dd'))
                setOpen(false)
              }
            }}
            classNames={{
              ...dayPickerClassNames,
              [UI.Root]: `${dayPickerClassNames[UI.Root]} mx-auto w-fit`,
              [UI.MonthGrid]: 'mx-auto w-fit border-collapse',
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left' ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ),
            }}
          />
        </div>
      )}
    </div>
  )
}

export { defaultAppearanceClassName as datePickerInputClassName }
