export function adminOrderSubject(order: unknown): string {
  const details = order && typeof order === "object"
    ? order as { display_id?: string | number; created_at?: string | Date | null }
    : undefined
  const number = details?.display_id
  const title = number === undefined || number === null
    ? "你有新订单了-New PetBoxNest order received"
    : `你有新订单了-New PetBoxNest order #${number}`

  // Older notification records may not contain a creation date. Never replace
  // the original date with the send/retry date.
  if (!details?.created_at) return title
  const createdAt = new Date(details.created_at)
  if (Number.isNaN(createdAt.getTime())) return title

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(createdAt)
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value
  return `${title} · ${part("year")}-${part("month")}-${part("day")}`
}
