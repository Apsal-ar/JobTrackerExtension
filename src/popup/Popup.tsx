import { format, parseISO } from 'date-fns'
import { useEffect, useState, type FormEvent } from 'react'
import { isLinkedInJobUrl } from '../lib/isLinkedInJobUrl'
import { parseTitleForJobInfo } from '../lib/parseTitleForJobInfo'
import { supabase } from '../lib/supabaseClient'

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

const inputClassName =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

function fieldClassName(saved: boolean): string {
  return saved
    ? `${inputClassName} bg-gray-50 text-gray-700 cursor-not-allowed`
    : inputClassName
}

export default function Popup() {
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [url, setUrl] = useState('')
  const [appliedAt, setAppliedAt] = useState(todayISO)
  const [cvUsed, setCvUsed] = useState('')
  const [effortLevel, setEffortLevel] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
      console.log('[duplicate-check] tabs:', tabs)
      const tab = tabs[0]
      if (!tab?.url) return

      const currentTabUrl = tab.url
      setUrl(currentTabUrl)

      console.log('[duplicate-check] currentTabUrl:', currentTabUrl)
      const { data, error: duplicateError } = await supabase
        .from('applications')
        .select('applied_date, applied_time')
        .eq('url', currentTabUrl)
        .maybeSingle()
      console.log('[duplicate-check] data, error:', data, duplicateError)

      if (!duplicateError && data?.applied_date) {
        const formattedDate = format(parseISO(data.applied_date), 'd MMMM yyyy')
        setDuplicateWarning(
          `You already applied to this job on ${formattedDate}.`,
        )
      }

      if (isLinkedInJobUrl(currentTabUrl) && tab.id !== undefined) {
        try {
          const response = await chrome.tabs.sendMessage(tab.id, {
            type: 'GET_LINKEDIN_JOB_INFO',
          })
          if (response?.jobTitle) setJobTitle(response.jobTitle)
          if (response?.company) setCompany(response.company)
        } catch {
          // content script unavailable — fail silently
        }
        return
      }

      if (tab.title) {
        const { jobTitle: guessedTitle, company: guessedCompany } =
          parseTitleForJobInfo(tab.title)
        if (guessedTitle) setJobTitle(guessedTitle)
        if (guessedCompany) setCompany(guessedCompany)
      }
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isSaving || saved) return

    setIsSaving(true)
    setError(null)

    try {
      console.log('[save] before insert')

      let source = ''
      try {
        source = new URL(url).hostname
      } catch {
        // leave source empty if URL is invalid
      }

      // applied_timestamp intentionally omitted — DB default (now()) records actual save time
      const { error: insertError } = await supabase.from('applications').insert({
        company,
        job_title: jobTitle,
        url,
        source,
        applied_date: appliedAt,
        status: 'applied',
        cv_used: cvUsed || null,
        effort_level: effortLevel || null,
      })

      console.log('[save] after insert', { insertError })

      if (insertError) {
        setError(insertError.message)
        return
      }

      setSaved(true)
      console.log('[save] success')
    } catch (err) {
      console.log('[save] catch', err)
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      console.log('[save] finally')
      setIsSaving(false)
    }
  }

  function openDashboard() {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') })
  }

  return (
    <div className="w-[380px] p-4 bg-white">
      <h1 className="text-lg font-semibold text-gray-900 mb-4">
        Save Application
      </h1>

      {duplicateWarning && (
        <p
          className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          role="status"
        >
          {duplicateWarning}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={fieldClassName(saved)}
            placeholder="Company name"
            disabled={saved}
          />
        </div>

        <div>
          <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            id="job_title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className={fieldClassName(saved)}
            placeholder="Job title"
            disabled={saved}
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={fieldClassName(saved)}
            disabled={saved}
          />
        </div>

        <div>
          <label htmlFor="applied_at" className="block text-sm font-medium text-gray-700 mb-1">
            Applied Date
          </label>
          <input
            id="applied_at"
            type="date"
            value={appliedAt}
            onChange={(e) => setAppliedAt(e.target.value)}
            className={fieldClassName(saved)}
            disabled={saved}
          />
        </div>

        <div>
          <label htmlFor="cv_used" className="block text-sm font-medium text-gray-700 mb-1">
            CV Used
          </label>
          <input
            id="cv_used"
            type="text"
            value={cvUsed}
            onChange={(e) => setCvUsed(e.target.value)}
            className={fieldClassName(saved)}
            placeholder="CV name"
            disabled={saved}
          />
        </div>

        <div>
          <label htmlFor="effort_level" className="block text-sm font-medium text-gray-700 mb-1">
            Effort Level
          </label>
          <select
            id="effort_level"
            value={effortLevel}
            onChange={(e) => setEffortLevel(e.target.value)}
            className={fieldClassName(saved)}
            disabled={saved}
          >
            <option value="">—</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving || saved}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saved
            ? 'Saved'
            : isSaving
              ? 'Saving...'
              : duplicateWarning
                ? 'Save Anyway'
                : 'Save Application'}
        </button>
      </form>

      <button
        type="button"
        onClick={openDashboard}
        className="mt-4 w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        View Dashboard
      </button>
    </div>
  )
}
