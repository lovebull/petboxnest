export const RETURN_WINDOW_DAYS = 15
export const DAMAGED_CLAIM_WINDOW_DAYS = 7

const DAY_MS = 86_400_000

export const deliveredAtForOrder = (order: any): Date | null => {
  const timestamps = (order.fulfillments || [])
    .map((fulfillment: any) => fulfillment.delivered_at)
    .filter(Boolean)
    .map((value: string | Date) => new Date(value))
    .filter((value: Date) => !Number.isNaN(value.getTime()))

  if (!timestamps.length) return null

  // Split shipments are fully delivered only after the final parcel arrives.
  return new Date(Math.max(...timestamps.map((value: Date) => value.getTime())))
}

export const shippedAtForOrder = (order: any): Date | null => {
  const timestamps = (order.fulfillments || [])
    .map((fulfillment: any) => fulfillment.shipped_at)
    .filter(Boolean)
    .map((value: string | Date) => new Date(value))
    .filter((value: Date) => !Number.isNaN(value.getTime()))

  if (!timestamps.length) return null
  return new Date(Math.max(...timestamps.map((value: Date) => value.getTime())))
}

export const elapsedCalendarDays = (from: Date, now = new Date()) =>
  Math.floor((now.getTime() - from.getTime()) / DAY_MS)

export const isWithinCalendarDays = (
  from: Date | null,
  days: number,
  now = new Date(),
) => Boolean(from && elapsedCalendarDays(from, now) <= days)
