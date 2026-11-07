import { getRecordedRefundAmount, getRefundHistorySummary } from "../../modules/resend/refund-history"

describe("Refund email history summary", () => {
  it("reports only a cumulative amount and does not choose a current refund", () => {
    const summary = getRefundHistorySummary([
      { id: "refund_old", amount: 12.5, created_at: "2026-11-01" },
      { id: "refund_new", amount: "7.50", created_at: "2026-11-06" },
    ])
    expect(summary).toEqual({ count: 2, cumulativeAmount: 20 })
    expect(summary).not.toHaveProperty("currentRefund")
    expect(summary).not.toHaveProperty("currentAmount")
  })

  it("does not assume that a single record is the refund that triggered the email", () => {
    expect(getRefundHistorySummary([{ amount: 7.5 }])).toEqual({ count: 1, cumulativeAmount: 7.5 })
  })

  it("does not infer a zero refund for empty history", () => {
    expect(getRefundHistorySummary([])).toEqual({ count: 0, cumulativeAmount: null })
  })

  it.each([undefined, null, "", "  ", "invalid", "Infinity", -1, NaN, Infinity])("does not calculate a partial total when an amount is missing or invalid: %p", (amount) => {
    expect(getRecordedRefundAmount(amount)).toBeNull()
    expect(getRefundHistorySummary([{ amount: 10 }, { amount }])).toEqual({ count: 2, cumulativeAmount: null })
  })

  it("preserves zero as a known recorded value", () => {
    expect(getRecordedRefundAmount(0)).toBe(0)
    expect(getRefundHistorySummary([{ amount: "0" }]).cumulativeAmount).toBe(0)
  })

  it("does not change the supplied records or their order", () => {
    const records = [{ id: "second", amount: 20 }, { id: "first", amount: 10 }]
    const before = JSON.stringify(records)
    expect(getRefundHistorySummary(records).cumulativeAmount).toBe(30)
    expect(JSON.stringify(records)).toBe(before)
  })
})
