import { format, parseISO } from 'date-fns'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import type { Interview } from '../../lib/interviewTypes'
import NextEventEditModal from './NextEventEditModal'

export interface NextEventRow {
  id: string
  application_id: string
  interview_date: string
  company: string | null
  recruiter: string | null
  interview_stage: string | null
}

interface NextEventsTableProps {
  events: NextEventRow[]
  onUpdated: () => void
}

export function toNextEventRows(
  interviews: Pick<
    Interview,
    | 'id'
    | 'application_id'
    | 'interview_date'
    | 'interviewer_name'
    | 'interview_stage'
  >[],
  companyByAppId: Map<string, string | null>,
  today: string,
): NextEventRow[] {
  return interviews
    .filter(
      (interview): interview is typeof interview & { interview_date: string } =>
        Boolean(interview.interview_date) &&
        interview.interview_date! >= today,
    )
    .sort((a, b) => a.interview_date.localeCompare(b.interview_date))
    .map((interview) => ({
      id: interview.id,
      application_id: interview.application_id,
      interview_date: interview.interview_date,
      company: companyByAppId.get(interview.application_id) ?? null,
      recruiter: interview.interviewer_name,
      interview_stage: interview.interview_stage,
    }))
}

export default function NextEventsTable({
  events,
  onUpdated,
}: NextEventsTableProps) {
  const [editingEvent, setEditingEvent] = useState<NextEventRow | null>(null)

  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No upcoming interviews scheduled.
      </p>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="pb-3 pr-3 font-semibold">Date</th>
              <th className="pb-3 pr-3 font-semibold">Company</th>
              <th className="pb-3 pr-3 font-semibold">Recruiter</th>
              <th className="pb-3 pr-3 font-semibold">Interview stage</th>
              <th className="pb-3 w-10" aria-hidden="true" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => (
              <tr key={event.id} className="text-slate-700">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-[#1e293b]">
                  {format(parseISO(event.interview_date), 'd MMM yyyy')}
                </td>
                <td className="py-3 pr-3">{event.company || '—'}</td>
                <td className="py-3 pr-3">{event.recruiter || '—'}</td>
                <td className="py-3 pr-3">{event.interview_stage || '—'}</td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(event)}
                    className="inline-flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                    aria-label={`Edit interview for ${event.company ?? 'application'}`}
                    title="Edit event"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingEvent && (
        <NextEventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={onUpdated}
        />
      )}
    </>
  )
}
