export interface Interview {
  id: string
  application_id: string
  interview_stage: string | null
  interviewer_name: string | null
  interview_date: string | null
  interview_type: string | null
  is_positive: boolean | null
  notes: string | null
}

export type InterviewOutcome = 'positive' | 'negative' | 'pending'

export function outcomeFromDb(isPositive: boolean | null): InterviewOutcome {
  if (isPositive === true) return 'positive'
  if (isPositive === false) return 'negative'
  return 'pending'
}

export function outcomeToDb(outcome: InterviewOutcome): boolean | null {
  if (outcome === 'positive') return true
  if (outcome === 'negative') return false
  return null
}

export function formatOutcome(isPositive: boolean | null): string {
  if (isPositive === true) return 'Successful'
  if (isPositive === false) return 'Unsuccessful'
  return 'Pending'
}
