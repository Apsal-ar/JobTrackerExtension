export interface Application {
  id: string
  company: string | null
  job_title: string | null
  url: string | null
  source: string | null
  applied_date: string | null
  cv_used: string | null
  effort_level: string | null
}

export type RangePreset = 'last7' | 'thisMonth' | 'custom'

export interface DateRange {
  start: Date
  end: Date
  label: string
}
