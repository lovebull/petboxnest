/** Validate email destinations without requesting the URL or altering stored data. */
export function getSafeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  // URL parsers silently strip controls or repair backslashes; reject these inputs.
  if (/[\u0000-\u001F\u007F\\]/.test(value)) return null
  const candidate = value.trim()
  if (!/^https?:\/\/[^/?#]/i.test(candidate) || /\s/.test(candidate) || /%(?![\da-f]{2})/i.test(candidate)) return null
  try {
    const url = new URL(candidate)
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}
