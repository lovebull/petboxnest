import { resolveResendSender } from "../../modules/resend/senders"

const senders = {
  from: "PetBoxNest <notifications@petboxnest.com>",
  from_orders: "PetBoxNest Orders <orders@petboxnest.com>",
  from_security: "PetBoxNest Security <security@petboxnest.com>",
  from_updates: "PetBoxNest Updates <updates@petboxnest.com>",
}

describe("Resend sender routing", () => {
  it.each(["order-placed", "admin-order-placed", "shipment-created", "payment-refunded", "after-sales-update"])(
    "routes %s to orders", (template) => expect(resolveResendSender(template, senders)).toBe(senders.from_orders),
  )
  it.each(["password-reset", "email-verification", "after-sales-code"])(
    "routes %s to security", (template) => expect(resolveResendSender(template, senders)).toBe(senders.from_security),
  )
  it.each(["restock-available", "abandoned-cart"])(
    "routes %s to updates", (template) => expect(resolveResendSender(template, senders)).toBe(senders.from_updates),
  )
  it("preserves default sender for unclassified templates", () => {
    expect(resolveResendSender("custom-template", senders)).toBe(senders.from)
  })
  it("preserves existing configuration when category senders are absent", () => {
    expect(resolveResendSender("order-placed", { from: senders.from })).toBe(senders.from)
    expect(resolveResendSender("order-placed", { ...senders, from_orders: "  " })).toBe(senders.from)
  })
})
