import { adminOrderSubject } from "../../modules/resend/admin-order-subject"

describe("admin order email subject", () => {
  it("uses the original order date in New York, not the UTC day", () => {
    expect(adminOrderSubject({ display_id: 123, created_at: "2026-11-05T02:00:00Z" }))
      .toBe("你有新订单了-New PetBoxNest order #123 · 2026-11-04")
  })
  it("handles daylight saving time", () => {
    expect(adminOrderSubject({ display_id: 456, created_at: new Date("2026-07-10T04:30:00Z") }))
      .toBe("你有新订单了-New PetBoxNest order #456 · 2026-07-10")
  })
  it.each([undefined, null, "invalid-date"])("does not invent dates for legacy records: %s", (created_at) => {
    expect(adminOrderSubject({ display_id: 1, created_at })).toBe("你有新订单了-New PetBoxNest order #1")
  })
  it("handles missing legacy order data", () => {
    expect(adminOrderSubject(undefined)).toBe("你有新订单了-New PetBoxNest order received")
  })
})
