import { getAfterSalesUpdateContent, getAfterSalesUpdateLink } from "../../modules/resend/after-sales-update-content"

const request = { request_number: "AS-TEST-001", status: "pending_review" }

describe("After-sales update email content", () => {
  it.each([
    "draft", "pending_review", "approved", "rejected", "awaiting_shipment",
    "in_transit", "received", "processing_refund", "refunded",
    "replacement_processing", "completed", "cancelled",
  ])("provides a label and next steps for %s", (status) => {
    const content = getAfterSalesUpdateContent({ ...request, status })
    expect(content.label).not.toBe("Updated")
    expect(content.next.length).toBeGreaterThan(30)
  })

  it("uses a safe label for unknown statuses", () => {
    expect(getAfterSalesUpdateContent({ ...request, status: "internal_status" }).label).toBe("Updated")
  })

  it("does not mistake cancellation of a request for order cancellation", () => {
    expect(getAfterSalesUpdateContent({ ...request, status: "cancelled" }).next).toContain("does not mean the order was cancelled or refunded")
  })

  it("does not imply that refund processing or replacement preparation is completed", () => {
    expect(getAfterSalesUpdateContent({ ...request, status: "processing_refund" }).next).toContain("does not mean the credit has reached")
    expect(getAfterSalesUpdateContent({ ...request, status: "replacement_processing" }).next).toContain("does not confirm")
    expect(getAfterSalesUpdateContent({ ...request, status: "approved" }).next).toContain("Only send items back if")
  })

  it("links customer orders to the existing account order detail page", () => {
    const link = getAfterSalesUpdateLink({ ...request, customer_id: "cus_test", order_id: "order_test" }, "https://www.petboxnest.com/")
    expect(link?.url).toBe("https://www.petboxnest.com/us/account/orders/details/order_test")
    expect(link?.instruction).toContain("Sign in")
  })

  it("uses the guest verification page without embedding customer email or access tokens", () => {
    const link = getAfterSalesUpdateLink({ ...request, order_id: "order_test" }, "https://www.petboxnest.com")
    expect(link?.url).toBe("https://www.petboxnest.com/us/returns")
    expect(link?.instruction).toContain("verify")
    expect(getAfterSalesUpdateLink(request, "https://www.petboxnest.com")?.url).toBe(link?.url)
  })

  it.each(["javascript:alert(1)", "not-a-url", "https://user:password@example.com", "ftp://example.com"])("rejects unsafe base URL %s", (url) => {
    expect(getAfterSalesUpdateLink(request, url)).toBeNull()
  })

  it("encodes the order ID instead of treating it as a path or query", () => {
    expect(getAfterSalesUpdateLink({ ...request, customer_id: "cus_test", order_id: "../other?private=1" }, "https://www.petboxnest.com")?.url).toContain("..%2Fother%3Fprivate%3D1")
  })
})
