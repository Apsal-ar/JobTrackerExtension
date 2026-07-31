import { format, parseISO } from 'date-fns'
import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import type { Application } from '../../lib/applicationTypes'
import { formatEffortLevel } from '../../lib/dashboardUtils'

const PAGE_SIZE = 25

interface ApplicationsTableProps {
  applications: Application[]
  rangeLabel: string
}

function EffortBadge({ level }: { level: string | null }) {
  if (!level) {
    return <span className="text-slate-400">—</span>
  }

  const styles: Record<string, string> = {
    low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    high: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        styles[level] ?? 'bg-slate-50 text-slate-600 ring-slate-500/20'
      }`}
    >
      {formatEffortLevel(level)}
    </span>
  )
}

export default function ApplicationsTable({
  applications,
  rangeLabel,
}: ApplicationsTableProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = applications.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )

  if (applications.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No applications in this range.
      </p>
    )
  }

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-700">
          {applications.length}
        </span>{' '}
        application{applications.length === 1 ? '' : 's'} in{' '}
        <span className="font-medium text-slate-600">{rangeLabel}</span>
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-teal-600">
              {[
                'Company',
                'Job Title',
                'Applied Date',
                'Source',
                'CV Used',
                'Effort',
                'URL',
              ].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-white"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((app, index) => (
              <tr
                key={app.id}
                className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-teal-50/40 ${
                  index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                }`}
              >
                <td className="px-5 py-4 font-medium text-[#1e293b]">
                  {app.company || '—'}
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {app.job_title || '—'}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {app.applied_date
                    ? format(parseISO(app.applied_date), 'd MMM yyyy')
                    : '—'}
                </td>
                <td className="max-w-[160px] truncate px-5 py-4 text-slate-600">
                  {app.source || '—'}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {app.cv_used?.trim() || '—'}
                </td>
                <td className="px-5 py-4">
                  <EffortBadge level={app.effort_level} />
                </td>
                <td className="px-5 py-4">
                  {app.url ? (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-600/20 transition-colors hover:bg-teal-100"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:shadow disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
