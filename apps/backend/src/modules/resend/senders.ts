export type ResendSenders = {
  from: string
  from_orders?: string
  from_security?: string
  from_updates?: string
  reply_to?: string
}

const groups: Record<string, keyof Pick<ResendSenders, "from_orders" | "from_security" | "from_updates">> = {
  "order-placed": "from_orders",
  "admin-order-placed": "from_orders",
  "shipment-created": "from_orders",
  "payment-refunded": "from_orders",
  "after-sales-update": "from_orders",
  "password-reset": "from_security",
  "email-verification": "from_security",
  "after-sales-code": "from_security",
  "restock-available": "from_updates",
  "abandoned-cart": "from_updates",
}

export function resolveResendSender(template: string, options: ResendSenders): string {
  const group = groups[template]
  return (group && options[group]?.trim()) || options.from
}
