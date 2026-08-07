import { CalendarDays, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import DatePicker, { datePickerInputClassName } from '../../components/DatePicker'
import { supabase } from '../../lib/supabaseClient'
import type { NextEventRow } from './NextEventsTable'

const inputClassName =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20'

interface NextEventEditModalProps {
  event: NextEventRow
  onClose: () => void
  onSaved: () => void
}

export default function NextEventEditModal({
  event,
  onClose,
  onSaved,
}: NextEventEditModalProps) {
  const [interviewDate, setInterviewDate] = useState(event.interview_date)
  const [recruiter, setRecruiter] = useState(event.recruiter ?? '')
  const [stage, setStage] = useState(event.interview_stage ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('interviews')
      .update({
        interview_date: interviewDate,
        interviewer_name: recruiter.trim() || null,
        interview_stage: stage.trim() || null,
      })
      .eq('id', event.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    onSaved()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="next-event-edit-title"
      >
        <div className="relative border-b border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-teal-600">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Edit event
              </span>
            </div>
            <h2
              id="next-event-edit-title"
              className="text-lg font-semibold text-[#1e293b]"
            >
              {event.company || 'Unknown company'}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-6 py-4">
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Date
            </label>
            <DatePicker
              value={interviewDate}
              onChange={setInterviewDate}
              className={datePickerInputClassName}
              popoverAlign="center"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Recruiter
            </label>
            <input
              type="text"
              value={recruiter}
              onChange={(e) => setRecruiter(e.target.value)}
              className={inputClassName}
              placeholder="Optional"
            />
          </div>

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
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
