export function isLinkedInJobUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      parsed.hostname === 'www.linkedin.com' &&
      parsed.pathname.startsWith('/jobs')
    )
  } catch {
    return false
  }
}
