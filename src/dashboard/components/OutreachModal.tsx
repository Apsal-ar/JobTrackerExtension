import { format } from 'date-fns'
import { Send, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import DatePicker, { datePickerInputClassName } from '../../components/DatePicker'
import type { Application } from '../../lib/applicationTypes'
import {
  OUTREACH_PLATFORM_SUGGESTIONS,
  OUTREACH_RESULT_OPTIONS,
  type OutreachResult,
} from '../../lib/outreachTypes'
import { supabase } from '../../lib/supabaseClient'
import ApplicationSearchSelect from './ApplicationSearchSelect'

const inputClassName =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20'

interface OutreachModalProps {
  applications: Application[]
  onClose: () => void
  onSaved: () => void
}

function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export default function OutreachModal({
  applications,
  onClose,
  onSaved,
}: OutreachModalProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [recruiterName, setRecruiterName] = useState('')
  const [recruiterCompany, setRecruiterCompany] = useState('')
  const [platform, setPlatform] = useState('')
  const [contactDate, setContactDate] = useState(todayISO)
  const [messageSummary, setMessageSummary] = useState('')
  const [result, setResult] = useState<OutreachResult>('pending')
  const [isScam, setIsScam] = useState(false)
  const [applicationId, setApplicationId] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('recruiter_outreach')
      .insert({
        recruiter_name: recruiterName.trim() || null,
        recruiter_company: recruiterCompany.trim() || null,
        platform: platform.trim() || null,
        contact_date: contactDate,
        message_summary: messageSummary.trim() || null,
        result,
        is_scam: isScam,
        application_id: applicationId || null,
      })

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
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
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="outreach-modal-title"
      >
        <div className="relative border-b border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="pr-8">
            <div className="mb-1 flex items-center gap-2 text-teal-600">
              <Send className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Recruiter outreach
              </span>
            </div>
            <h2
              id="outreach-modal-title"
              className="text-lg font-semibold text-[#1e293b]"
            >
              Log recruiter outreach
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-5 py-4">
          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Contact date
            </label>
            <DatePicker
              value={contactDate}
              onChange={setContactDate}
              className={datePickerInputClassName}
              popoverAlign="center"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Recruiter name
            </label>
            <input
              type="text"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              className={inputClassName}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Recruiter company
            </label>
            <input
              type="text"
              value={recruiterCompany}
              onChange={(e) => setRecruiterCompany(e.target.value)}
              className={inputClassName}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Platform
            </label>
            <input
              type="text"
              list="outreach-platform-suggestions"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={inputClassName}
              placeholder="LinkedIn, Email…"
            />
            <datalist id="outreach-platform-suggestions">
              {OUTREACH_PLATFORM_SUGGESTIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Linked application
            </label>
            <ApplicationSearchSelect
              applications={applications}
              value={applicationId}
              onChange={setApplicationId}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Message summary
            </label>
            <textarea
              value={messageSummary}
              onChange={(e) => setMessageSummary(e.target.value)}
              className={`${inputClassName} min-h-[72px] resize-y`}
              placeholder="What you said / context"
              rows={3}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Result
            </label>
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-100/80 p-1">
              {OUTREACH_RESULT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setResult(value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    result === value
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isScam}
              onChange={(e) => setIsScam(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/30"
            />
            Mark as scam / suspicious
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save outreach'}
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
