import { eligibilityFor } from "../after-sales-helpers";
import { createInvoicePdf } from "../invoice-pdf";

describe("PetBoxNest after-sales helpers", () => {
  const baseOrder = {
    id: "order_test",
    created_at: new Date().toISOString(),
    status: "pending",
    canceled_at: null,
    fulfillment_status: "not_fulfilled",
  };

  it("allows cancellation only before fulfillment", () => {
    expect(eligibilityFor(baseOrder).cancel).toBe(true);
    expect(
      eligibilityFor({ ...baseOrder, fulfillment_status: "fulfilled" }).cancel,
    ).toBe(false);
    expect(
      eligibilityFor({ ...baseOrder, canceled_at: new Date() }).cancel,
    ).toBe(false);
  });

  it("opens returns for 15 days after confirmed delivery and never offers direct exchanges", () => {
    const eligibility = eligibilityFor({
      ...baseOrder,
      fulfillment_status: "delivered",
      fulfillments: [{ delivered_at: new Date().toISOString() }],
    });
    expect(eligibility.return).toBe(true);
    expect(eligibility.exchange).toBe(false);
  });

  it("uses the final parcel delivery time and closes the return window after 15 calendar days", () => {
    const now = Date.now();
    const withinWindow = eligibilityFor({
      ...baseOrder,
      fulfillment_status: "delivered",
      fulfillments: [
        { delivered_at: new Date(now - 20 * 86_400_000).toISOString() },
        { delivered_at: new Date(now - 10 * 86_400_000).toISOString() },
      ],
    });
    const outsideWindow = eligibilityFor({
      ...baseOrder,
      fulfillment_status: "delivered",
      fulfillments: [
        { delivered_at: new Date(now - 16 * 86_400_000).toISOString() },
      ],
    });
    expect(withinWindow.return).toBe(true);
    expect(outsideWindow.return).toBe(false);
  });

  it("does not infer delivery from order creation time", () => {
    const eligibility = eligibilityFor({
      ...baseOrder,
      fulfillment_status: "delivered",
      fulfillments: [],
    });
    expect(eligibility.return).toBe(false);
    expect(eligibility.reasons.return).toContain("confirmed delivery time");
  });

  it("opens a delivered-package claim after 48 hours but within 7 days", () => {
    const now = Date.now();
    const tooEarly = eligibilityFor({
      ...baseOrder,
      fulfillment_status: "delivered",
      fulfillments: [{ delivered_at: new Date(now - 86_400_000).toISOString() }],
    });
    const eligible = eligibilityFor({
      ...baseOrder,
      fulfillment_status: "delivered",
      fulfillments: [{ delivered_at: new Date(now - 3 * 86_400_000).toISOString() }],
    });
    expect(tooEarly.lost_claim).toBe(false);
    expect(eligible.lost_claim).toBe(true);
  });

  it("creates a valid one-page PDF receipt", () => {
    const pdf = createInvoicePdf({
      display_id: 1234,
      created_at: new Date().toISOString(),
      email: "customer@example.com",
      currency_code: "usd",
      items: [{ title: "Pet bed", quantity: 1, unit_price: 49.99 }],
      subtotal: 49.99,
      shipping_total: 0,
      tax_total: 0,
      total: 49.99,
    });
    expect(pdf.subarray(0, 8).toString()).toBe("%PDF-1.4");
    expect(pdf.toString()).toContain("Invoice / Receipt for order #1234");
    expect(pdf.toString()).toContain("startxref");
  });
});
