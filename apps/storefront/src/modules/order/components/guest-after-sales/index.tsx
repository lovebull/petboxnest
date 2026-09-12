"use client"

import { FormEvent, useState } from "react"
import {
  createGuestAfterSales,
  getGuestAfterSalesOrder,
  requestGuestAfterSalesCode,
  verifyGuestAfterSalesCode,
  uploadAfterSalesEvidence,
} from "@lib/data/after-sales"

const statusLabels: Record<string, string> = {
  pending_review: "Under review",
  approved: "Approved",
  rejected: "Not approved",
  awaiting_shipment: "Awaiting return shipment",
  in_transit: "Return in transit",
  received: "Received",
  processing_refund: "Refund processing",
  refunded: "Refund sent",
  replacement_processing: "Replacement processing",
  completed: "Completed",
  cancelled: "Cancelled",
}

export default function GuestAfterSales() {
  const [step, setStep] = useState<"lookup" | "verify" | "order" | "done">(
    "lookup",
  )
  const [reference, setReference] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [orderId, setOrderId] = useState("")
  const [token, setToken] = useState("")
  const [data, setData] = useState<any>(null)
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [reason, setReason] = useState("changed_mind")
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [message, setMessage] = useState("")

  const requestCode = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setMessage("")
    const result = await requestGuestAfterSalesCode(reference, email)
    setPending(false)
    if (result.error) return setMessage(result.error)
    if (result.development_code) setCode(result.development_code)
    setStep("verify")
    setMessage(result.message)
  }
  const verify = async (event: FormEvent) => {
    event.preventDefault()
    setPending(true)
    setMessage("")
    const result = await verifyGuestAfterSalesCode(reference, email, code)
    if (result.error) {
      setPending(false)
      return setMessage(result.error)
    }
    const order = await getGuestAfterSalesOrder(
      result.order_id,
      result.access_token,
    )
    setPending(false)
    if (order.error) return setMessage(order.error)
    setOrderId(result.order_id)
    setToken(result.access_token)
    setData(order)
    setStep("order")
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const items = Object.entries(selected)
      .filter(([, quantity]) => quantity > 0)
      .map(([order_item_id, quantity]) => ({
        order_item_id,
        quantity,
        reason_code: reason,
      }))
    if (!items.length) return setMessage("Select at least one item to return.")
    setPending(true)
    setMessage("")
    let attachments: any[] | undefined
    if (files.length) {
      const formData = new FormData()
      formData.set("order_id", orderId)
      formData.set("guest_access_token", token)
      files.forEach((file) => formData.append("files", file))
      const upload = await uploadAfterSalesEvidence(formData)
      if (upload.error) {
        setPending(false)
        return setMessage(upload.error)
      }
      attachments = upload.attachments
    }
    const result = await createGuestAfterSales({
      order_id: orderId,
      guest_access_token: token,
      type: "return",
      reason_code: reason,
      customer_note: note || null,
      items,
      attachment_urls: attachments,
    })
    setPending(false)
    if (result.error) return setMessage(result.error)
    setStep("done")
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 small:py-20">
      <div className="rounded-[28px] bg-cream p-6 small:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
          Guest order care
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-ink small:text-5xl">
          Start a return without an account.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Use the order number and email from checkout. We’ll send a one-time
          code before showing order details.
        </p>
      </div>
      <div className="mt-6 rounded-[24px] border border-[#E6E8EC] bg-white p-6 small:p-8">
        {step === "lookup" && (
          <form onSubmit={requestCode} className="space-y-5">
            <Field
              label="Order number"
              value={reference}
              onChange={setReference}
              placeholder="For example, 1234"
            />
            <Field
              label="Checkout email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
            />
            <button
              disabled={pending}
              className="min-h-12 w-full rounded-[15px] bg-brand px-5 font-bold text-white disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send verification code"}
            </button>
          </form>
        )}
        {step === "verify" && (
          <form onSubmit={verify} className="space-y-5">
            <button
              type="button"
              className="text-sm font-bold text-brand"
              onClick={() => setStep("lookup")}
            >
              ← Change order details
            </button>
            <Field
              label="Six-digit verification code"
              value={code}
              onChange={setCode}
              placeholder="000000"
            />
            <button
              disabled={pending}
              className="min-h-12 w-full rounded-[15px] bg-ink px-5 font-bold text-white disabled:opacity-50"
            >
              {pending ? "Checking…" : "Open order"}
            </button>
          </form>
        )}
        {step === "order" && (
          <form onSubmit={submit}>
            <h2 className="font-display text-2xl font-bold text-ink">
              Order #{data.order.display_id}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Choose the delivered items you want to return.
            </p>
            <div className="mt-5 space-y-3">
              {data.order.items?.map((item: any) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[16px] bg-mist p-4"
                >
                  <span className="font-semibold text-ink">
                    {item.title}
                    <small className="mt-1 block font-normal text-muted">
                      Purchased: {item.quantity}
                    </small>
                  </span>
                  <input
                    className="h-11 w-20 rounded-xl border px-3"
                    aria-label={`Return quantity for ${item.title}`}
                    type="number"
                    min={0}
                    max={item.quantity}
                    value={selected[item.id] || 0}
                    onChange={(event) =>
                      setSelected((current) => ({
                        ...current,
                        [item.id]: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <label className="mt-5 block text-sm font-bold">
              Return reason
              <select
                className="mt-2 min-h-12 w-full rounded-xl border bg-white px-3 font-normal"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              >
                <option value="changed_mind">Changed my mind</option>
                <option value="wrong_item">Wrong item received</option>
                <option value="damaged">Damaged item</option>
                <option value="not_as_expected">Not as expected</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-bold">
              Evidence photos (optional)
              <span className="mt-1 block text-xs font-normal text-muted">
                Up to 8 JPG, PNG, or WebP images, 8 MB each.
              </span>
              <input
                className="mt-2 block min-h-12 w-full rounded-xl border bg-white p-3 text-sm font-normal"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 8))}
              />
            </label>
            <label className="mt-5 block text-sm font-bold">
              Additional details
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border p-3 font-normal"
                value={note}
                maxLength={2000}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
            <button
              disabled={pending || !data.eligibility.return}
              className="mt-5 min-h-12 w-full rounded-[15px] bg-brand px-5 font-bold text-white disabled:opacity-50"
            >
              {pending
                ? "Submitting…"
                : data.eligibility.return
                  ? "Submit return request"
                  : "This order is not currently eligible"}
            </button>
            {!data.eligibility.return && data.eligibility.reasons?.return && (
              <p role="status" className="mt-3 text-sm text-muted">
                {data.eligibility.reasons.return}
              </p>
            )}
            {!!data.requests?.length && (
              <section className="mt-8 border-t border-[#E6E8EC] pt-6" aria-labelledby="guest-request-progress">
                <h3 id="guest-request-progress" className="font-display text-xl font-bold text-ink">
                  Existing request progress
                </h3>
                <div className="mt-3 space-y-3">
                  {data.requests.map((request: any) => (
                    <article key={request.id} className="rounded-[16px] bg-mist p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>{request.request_number}</strong>
                        <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">
                          {statusLabels[request.status] || request.status}
                        </span>
                      </div>
                      {request.customer_message && (
                        <p className="mt-3 text-sm text-ink">
                          <strong>Message from PetBoxNest:</strong>{" "}
                          {request.customer_message}
                        </p>
                      )}
                      <ol className="mt-3 border-l-2 border-mint pl-4">
                        {request.history?.map((entry: any) => (
                          <li key={entry.id} className="mb-2 text-sm text-muted">
                            <strong className="text-ink">
                              {statusLabels[entry.to_status] || entry.to_status}
                            </strong>{" "}
                            · {new Date(entry.created_at).toLocaleString()}
                            {entry.public_note && (
                              <span className="mt-1 block">{entry.public_note}</span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </form>
        )}
        {step === "done" && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint text-2xl text-ink">
              ✓
            </div>
            <h2 className="mt-5 font-display text-3xl font-bold text-ink">
              Return request received.
            </h2>
            <p className="mt-3 text-muted">
              We’ll email you as the request moves forward. Keep the item until
              return instructions arrive.
            </p>
            <button
              className="mt-6 min-h-11 rounded-[14px] border border-ink px-5 font-bold"
              onClick={() => {
                setStep("lookup")
                setReference("")
                setEmail("")
                setCode("")
              }}
            >
              Look up another order
            </button>
          </div>
        )}
        {message && (
          <p
            role="status"
            className="mt-5 rounded-[14px] bg-mist p-3 text-sm text-muted"
          >
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-12 w-full rounded-xl border border-[#E6E8EC] px-4 font-normal outline-none focus:border-brand"
      />
    </label>
  )
}
