/**
 * Normalize job posting URLs for duplicate detection.
 * - Host is case-insensitive
 * - Path keeps case (URL paths are case-sensitive on most servers)
 * - Trailing slashes on the path are removed (except bare "/")
 */
export function normalizeApplicationUrl(url: string): string {
  const trimmed = url.trim()

  try {
    const parsed = new URL(trimmed)
    const host = parsed.host.toLowerCase()
    let pathname = parsed.pathname

    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1)
    }

    return `${parsed.protocol}//${host}${pathname}${parsed.search}${parsed.hash}`
  } catch {
    return trimmed
  }
}

export function isDuplicateApplicationUrl(
  candidateUrl: string,
  existingUrl: string,
): boolean {
  return (
    normalizeApplicationUrl(candidateUrl) ===
    normalizeApplicationUrl(existingUrl)
  )
}
