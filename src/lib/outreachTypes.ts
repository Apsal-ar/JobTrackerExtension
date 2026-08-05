export type OutreachResult = 'accepted' | 'pending' | 'rejected'

export interface RecruiterOutreach {
  id: string
  application_id: string | null
  recruiter_name: string | null
  recruiter_company: string | null
  platform: string | null
  contact_date: string
  message_summary: string | null
  status: string | null
  is_scam: boolean
  result: OutreachResult | null
}

export const OUTREACH_RESULT_OPTIONS: {
  value: OutreachResult
  label: string
}[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

export const OUTREACH_PLATFORM_SUGGESTIONS = [
  'LinkedIn',
  'Email',
  'Twitter',
  'Wellfound',
  'Other',
]
