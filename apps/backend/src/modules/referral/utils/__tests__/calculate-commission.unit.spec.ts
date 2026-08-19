import { calculateCommission } from "../calculate-commission"

const rule = {
  commission_percentage: 8,
  minimum_order_amount: 80,
  maximum_commission_amount: 30,
}

describe("calculateCommission", () => {
  it("returns zero below the minimum order amount", () => {
    expect(calculateCommission(79.99, rule)).toBe(0)
  })

  it("calculates and rounds a percentage commission", () => {
    expect(calculateCommission(123.45, rule)).toBe(9.88)
  })

  it("caps commission at the configured maximum", () => {
    expect(calculateCommission(500, rule)).toBe(30)
  })

  it("supports a program without a maximum", () => {
    expect(
      calculateCommission(500, {
        ...rule,
        maximum_commission_amount: null,
      })
    ).toBe(40)
  })
})
