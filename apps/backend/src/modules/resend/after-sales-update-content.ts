export type AfterSalesEmailRequest = {
  request_number: string
  status: string
  customer_message?: string | null
  customer_id?: string | null
  order_id?: string | null
  type?: string | null
}

const statuses: Record<string, { label: string; next: string }> = {
  draft: { label: "Draft", next: "Review your request details. Contact us if you need help completing your request." },
  pending_review: { label: "Under review", next: "Our team is reviewing your request. Keep your items until you receive further instructions." },
  approved: { label: "Approved", next: "Review the message and request timeline for your next steps. Only send items back if return instructions have been provided." },
  rejected: { label: "Not approved", next: "Review the message and request timeline for more information. Contact us with your request number if you have questions." },
  awaiting_shipment: { label: "Awaiting return shipment", next: "Follow the return address and shipping instructions provided by our team. Keep your proof of postage and tracking number. If instructions are missing, contact us before shipping." },
  in_transit: { label: "Return in transit", next: "Keep your tracking number and proof of postage. Check your request timeline for further updates about the return." },
  received: { label: "Return received", next: "Your return has been received. Check the request timeline for the outcome of the review and the next step in your resolution." },
  processing_refund: { label: "Refund processing", next: "Your refund is being processed. This status does not mean the credit has reached your account. Check the request timeline for updates." },
  refunded: { label: "Refund sent", next: "Check the refund details and your original payment method. Your bank or payment provider may need time to post the credit. Contact us if you need help." },
  replacement_processing: { label: "Replacement processing", next: "Your replacement is being arranged. Review the request timeline for updates. This status does not confirm that a replacement has shipped." },
  completed: { label: "Completed", next: "Review the request timeline for the final resolution. Contact us with your request number if you still need help." },
  cancelled: { label: "Request cancelled", next: "This after-sales request has been cancelled. This status alone does not mean the order was cancelled or refunded. Contact us if you still need help." },
}

const types: Record<string, string> = {
  cancel: "Cancellation", return: "Return", exchange: "Exchange",
  damaged_claim: "Damaged item claim", lost_claim: "Lost package claim",
}

export function getAfterSalesUpdateContent(request: AfterSalesEmailRequest) {
  const content = statuses[request.status] || {
    label: "Updated", next: "Review your request timeline for the latest information. Contact us if you have questions about the next step.",
  }
  return { ...content, typeLabel: request.type ? types[request.type] : undefined }
}

export function getAfterSalesUpdateLink(request: AfterSalesEmailRequest, storefrontUrl: string) {
  try {
    const base = new URL(storefrontUrl)
    if (!["https:", "http:"].includes(base.protocol) || base.username || base.password) return null
    const account = Boolean(request.customer_id && request.order_id)
    const path = account
      ? `/us/account/orders/details/${encodeURIComponent(request.order_id!)}`
      : "/us/returns"
    return {
      url: new URL(path, base).toString(),
      instruction: account
        ? "Sign in with the account used for your order to view its after-sales section and request timeline."
        : "Enter your order number and checkout email, then verify the emailed code to view your existing request progress.",
    }
  } catch {
    return null
  }
}
