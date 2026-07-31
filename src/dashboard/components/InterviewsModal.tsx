import { format, parseISO } from 'date-fns'
import { CalendarDays, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { Application } from '../../lib/applicationTypes'
import type { Interview, InterviewOutcome } from '../../lib/interviewTypes'
import { formatOutcome, outcomeToDb } from '../../lib/interviewTypes'
import { supabase } from '../../lib/supabaseClient'

const INTERVIEW_TYPE_SUGGESTIONS = [
  'Phone',
  'Video',
  'On-site',
  'Technical',
  'Behavioral',
]

const inputClassName =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20'

interface InterviewsModalProps {
  application: Application
  onClose: () => void
  onUpdated: () => void
}

function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export default function InterviewsModal({
  application,
  onClose,
  onUpdated,
}: InterviewsModalProps) {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [stage, setStage] = useState('')
  const [interviewerName, setInterviewerName] = useState('')
  const [interviewDate, setInterviewDate] = useState(todayISO)
  const [interviewType, setInterviewType] = useState('')
  const [outcome, setOutcome] = useState<InterviewOutcome>('pending')
  const [notes, setNotes] = useState('')

  async function loadInterviews() {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('interviews')
      .select('*')
      .eq('application_id', application.id)
      .order('interview_date', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setInterviews([])
    } else {
      setInterviews((data as Interview[]) ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadInterviews()
  }, [application.id])

  function resetForm() {
    setStage('')
    setInterviewerName('')
    setInterviewDate(todayISO())
    setInterviewType('')
    setOutcome('pending')
    setNotes('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase.from('interviews').insert({
      application_id: application.id,
      stage: stage.trim() || null,
      interviewer_name: interviewerName.trim() || null,
      interview_date: interviewDate,
      interview_type: interviewType.trim() || null,
      is_positive: outcomeToDb(outcome),
      notes: notes.trim() || null,
    })

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    resetForm()
    setShowForm(false)
    await loadInterviews()
    onUpdated()
  }

  async function handleDelete(interviewId: string) {
    setError(null)
    const { error: deleteError } = await supabase
      .from('interviews')
      .delete()
      .eq('id', interviewId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await loadInterviews()
    onUpdated()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="interviews-modal-title"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2 text-teal-600">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Interviews
              </span>
            </div>
            <h2
              id="interviews-modal-title"
              className="text-lg font-semibold text-[#1e293b]"
            >
              {application.company || 'Unknown company'}
            </h2>
            <p className="text-sm text-slate-500">
              {application.job_title || 'No job title'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-4">
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Loading interviews…
            </p>
          ) : interviews.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">
              No interviews logged yet for this application.
            </p>
          ) : (
            <ul className="space-y-3">
              {interviews.map((interview) => (
                <li
                  key={interview.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#1e293b]">
                        {interview.stage || 'Interview round'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {interview.interview_date
                          ? format(
                              parseISO(interview.interview_date),
                              'd MMM yyyy',
                            )
                          : 'No date'}
                        {interview.interview_type &&
                          ` · ${interview.interview_type}`}
                        {interview.interviewer_name &&
                          ` · ${interview.interviewer_name}`}
                      </p>
                      <p className="mt-1 text-xs">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 font-medium ${
                            interview.is_positive === true
                              ? 'bg-emerald-50 text-emerald-700'
                              : interview.is_positive === false
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {formatOutcome(interview.is_positive)}
                        </span>
                      </p>
                      {interview.notes && (
                        <p className="mt-2 text-xs text-slate-600">
                          {interview.notes}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(interview.id)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete interview"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-100 pt-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Interview stage
                </label>
                <input
                  type="text"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className={inputClassName}
                  placeholder="Phone Screen, Technical Round…"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Interviewer name
                </label>
                <input
                  type="text"
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className={inputClassName}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Interview type
                </label>
                <input
                  type="text"
                  list="interview-type-suggestions"
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className={inputClassName}
                  placeholder="Phone, Video, On-site…"
                />
                <datalist id="interview-type-suggestions">
                  {INTERVIEW_TYPE_SUGGESTIONS.map((type) => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Outcome
                </label>
                <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/80 p-1">
                  {(
                    [
                      ['positive', 'Positive'],
                      ['negative', 'Negative'],
                      ['pending', 'Pending'],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setOutcome(value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        outcome === value
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-white/70'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`${inputClassName} min-h-[72px] resize-y`}
                  placeholder="Optional"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full rounded-lg border border-dashed border-teal-300 bg-teal-50/50 px-4 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50"
            >
              + Add interview round
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
