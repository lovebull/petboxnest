export type RefundHistoryRecord = {
  id?: string
  amount?: number | string | null
  created_at?: string | Date | null
}

export function getRecordedRefundAmount(value: RefundHistoryRecord["amount"]): number | null {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

/** History only: the payment event does not identify a current refund record. */
export function getRefundHistorySummary(records: RefundHistoryRecord[]) {
  if (!records.length) return { count: 0, cumulativeAmount: null }
  const amounts = records.map(record => getRecordedRefundAmount(record.amount))
  if (amounts.some(amount => amount === null)) return { count: records.length, cumulativeAmount: null }
  const sum = amounts.reduce<number>((total, amount) => total + (amount ?? 0), 0)
  return { count: records.length, cumulativeAmount: Number.isFinite(sum) ? sum : null }
}
