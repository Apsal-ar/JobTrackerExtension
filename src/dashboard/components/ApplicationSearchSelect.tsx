import { Search, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { Application } from '../../lib/applicationTypes'

const inputClassName =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20'

interface ApplicationSearchSelectProps {
  applications: Application[]
  value: string
  onChange: (applicationId: string) => void
}

function applicationLabel(app: Application): string {
  return (
    [app.company, app.job_title].filter(Boolean).join(' — ') ||
    'Untitled application'
  )
}

export default function ApplicationSearchSelect({
  applications,
  value,
  onChange,
}: ApplicationSearchSelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimeout = useRef<number | null>(null)

  const selected = useMemo(
    () => applications.find((app) => app.id === value) ?? null,
    [applications, value],
  )

  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []

    return applications
      .filter((app) => {
        const company = app.company?.toLowerCase() ?? ''
        const title = app.job_title?.toLowerCase() ?? ''
        return company.includes(trimmed) || title.includes(trimmed)
      })
      .slice(0, 12)
  }, [applications, query])

  function clearBlurTimeout() {
    if (blurTimeout.current !== null) {
      window.clearTimeout(blurTimeout.current)
      blurTimeout.current = null
    }
  }

  function handleBlur() {
    clearBlurTimeout()
    blurTimeout.current = window.setTimeout(() => setOpen(false), 120)
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span className="min-w-0 truncate">{applicationLabel(selected)}</span>
        <button
          type="button"
          onClick={() => onChange('')}
          className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
          aria-label="Clear linked application"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative" onBlur={handleBlur} onFocus={clearBlurTimeout}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className={`${inputClassName} pl-9`}
          placeholder="Search company or role…"
          autoComplete="off"
        />
      </div>

      {open && query.trim() && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">
              No applications match “{query.trim()}”
            </li>
          ) : (
            matches.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(app.id)
                    setQuery('')
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-teal-50 hover:text-teal-900"
                >
                  {applicationLabel(app)}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {open && !query.trim() && (
        <p className="mt-1.5 text-xs text-slate-400">
          Type to search applications. Leave empty for none.
        </p>
      )}
    </div>
  )
}
