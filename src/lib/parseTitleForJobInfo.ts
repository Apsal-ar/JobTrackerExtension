export function parseTitleForJobInfo(title: string): {
  jobTitle: string
  company: string
} {
  const empty = { jobTitle: '', company: '' }
  if (!title.trim()) return empty

  const normalized = title.split('|')[0].trim()

  const hiringAtMatch = normalized.match(/^(.+?)\s+hiring at\s+(.+)$/i)
  if (hiringAtMatch) {
    return {
      jobTitle: hiringAtMatch[1].trim(),
      company: hiringAtMatch[2].trim(),
    }
  }

  const hiringMatch = normalized.match(/^(.+?)\s+hiring\s+(.+)$/i)
  if (hiringMatch) {
    return {
      jobTitle: hiringMatch[2].trim(),
      company: hiringMatch[1].trim(),
    }
  }

  const dashIndex = normalized.lastIndexOf(' - ')
  if (dashIndex !== -1) {
    const jobTitlePart = normalized.slice(0, dashIndex).trim()
    const companyPart = normalized.slice(dashIndex + 3).trim()
    if (jobTitlePart && companyPart) {
      return { jobTitle: jobTitlePart, company: companyPart }
    }
  }

  return empty
}
