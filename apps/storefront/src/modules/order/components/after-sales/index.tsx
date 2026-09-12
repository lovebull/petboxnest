"use client"

import { HttpTypes } from "@medusajs/types"
import { useEffect, useMemo, useState } from "react"
import {
  cancelOrderAfterSales,
  createOrderAfterSales,
  downloadOrderInvoice,
  getOrderAfterSales,
  type AfterSalesType,
  uploadAfterSalesEvidence,
} from "@lib/data/after-sales"

const typeLabels: Record<AfterSalesType, string> = {
  cancel: "Cancel order",
  return: "Return items",
  damaged_claim: "Report damaged or missing items",
  lost_claim: "Report a lost package",
}
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
const requestTypeLabel = (type: string) =>
  typeLabels[type as AfterSalesType] ||
  (type === "exchange" ? "Exchange (legacy request)" : type)

export default function AfterSales({ order }: { order: HttpTypes.StoreOrder }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")
  const [open, setOpen] = useState<AfterSalesType | null>(null)
  const [selected, setSelected] = useState<Record<string, number>>({})
  const [reason, setReason] = useState("changed_mind")
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const refresh = async () => {
    const result = await getOrderAfterSales(order.id)
    if (result.error) setError(result.error)
    else setData(result)
  }
  useEffect(() => {
    void refresh()
  }, [order.id])
  const tracking = useMemo(
    () =>
      (data?.order?.fulfillments || []).flatMap(
        (fulfillment: any) => fulfillment.labels || [],
      ),
    [data],
  )

  const submit = async () => {
    if (!open) return
    const items =
      open === "cancel"
        ? []
        : Object.entries(selected)
            .filter(([, quantity]) => quantity > 0)
            .map(([order_item_id, quantity]) => ({
              order_item_id,
              quantity,
              reason_code: reason,
            }))
    if (open !== "cancel" && !items.length)
      return setError("Select at least one item.")
    setPending(true)
    setError("")
    let attachments: any[] | undefined
    if (files.length) {
      const formData = new FormData()
      formData.set("order_id", order.id)
      files.forEach((file) => formData.append("files", file))
      const upload = await uploadAfterSalesEvidence(formData)
      if (upload.error) {
        setPending(false)
        return setError(upload.error)
      }
      attachments = upload.attachments
    }
    const result = await createOrderAfterSales(order.id, {
      type: open,
      reason_code: reason,
      customer_note: note || null,
      items,
      attachment_urls: attachments,
    })
    setPending(false)
    if (result.error) return setError(result.error)
    setOpen(null)
    setSelected({})
    setNote("")
    setFiles([])
    await refresh()
  }
  const invoice = async () => {
    const result = await downloadOrderInvoice(order.id)
    if ("error" in result)
      return setError(result.error || "Unable to download invoice")
    const bytes = Uint8Array.from(atob(result.base64), (character) =>
      character.charCodeAt(0),
    )
    const url = URL.createObjectURL(
      new Blob([bytes], { type: result.content_type }),
    )
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = result.filename
    anchor.click()
    URL.revokeObjectURL(url)
  }
  const cancelRequest = async (requestId: string) => {
    setPending(true)
    const result = await cancelOrderAfterSales(requestId)
    setPending(false)
    if (result.error) return setError(result.error)
    await refresh()
  }

  return (
    <section
      className="mt-6 rounded-[24px] border border-[#E6E8EC] bg-cream p-5 small:p-7"
      aria-labelledby="order-care-title"
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
        PetBoxNest order care
      </p>
      <div className="mt-2 flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
        <div>
          <h2
            id="order-care-title"
            className="font-display text-2xl font-bold text-ink"
          >
            Delivery, invoices &amp; after-sales
          </h2>
          <p className="mt-1 text-sm text-muted">
            Everything for this order, kept in one calm corner.
          </p>
        </div>
        <button
          onClick={invoice}
          className="pbn-focus min-h-11 rounded-[14px] border border-ink bg-white px-5 text-sm font-bold text-ink hover:bg-mist"
        >
          Download invoice
        </button>
      </div>
      {tracking.length > 0 && (
        <div className="mt-5 rounded-[18px] bg-white p-4">
          <h3 className="font-bold text-ink">Track your package</h3>
          {tracking.map((label: any, index: number) => (
            <div
              key={label.id || index}
              className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm"
            >
              <span>
                {label.tracking_number || "Tracking is being prepared"}
              </span>
              {label.tracking_url && (
                <a
                  className="font-bold text-brand underline underline-offset-4"
                  href={label.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open carrier tracking
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 grid gap-3 small:grid-cols-2">
        {(Object.keys(typeLabels) as AfterSalesType[]).map(
          (type) =>
            data?.eligibility?.[type] && (
              <button
                key={type}
                onClick={() => setOpen(type)}
                className="pbn-focus min-h-12 rounded-[16px] bg-brand px-4 text-sm font-bold text-white hover:bg-[#4A3DB8]"
              >
                {typeLabels[type]}
              </button>
            ),
        )}
      </div>
      {data?.eligibility?.reasons?.exchange && (
        <p className="mt-4 text-sm text-muted">
          Need another item instead? {data.eligibility.reasons.exchange}
        </p>
      )}
      {data &&
        !(Object.keys(typeLabels) as AfterSalesType[]).some(
          (type) => data.eligibility?.[type],
        ) && (
          <p className="mt-5 rounded-[16px] bg-white p-4 text-sm text-muted">
            No self-service action is currently available for this order.
            Customer care can still help.
          </p>
        )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-[14px] bg-[#FFF0EF] p-3 text-sm font-semibold text-[#B5403C]"
        >
          {error}
        </p>
      )}
      {open && (
        <div className="mt-5 rounded-[20px] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">
                {typeLabels[open]}
              </h3>
              <p className="mt-1 text-sm text-muted">
                We will review your request before changing the order or
                payment.
              </p>
            </div>
            <button
              className="min-h-11 px-3 font-bold"
              onClick={() => setOpen(null)}
              aria-label="Close form"
            >
              ×
            </button>
          </div>
          {open !== "cancel" && (
            <div className="mt-4 space-y-3">
              {order.items?.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[14px] border border-[#E6E8EC] p-3"
                >
                  <span className="text-sm font-semibold">
                    {item.title} · purchased {item.quantity}
                  </span>
                  <input
                    aria-label={`Quantity for ${item.title}`}
                    className="h-11 w-20 rounded-xl border px-3"
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
          )}
          <label className="mt-4 block text-sm font-bold">
            Reason
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-[#E6E8EC] bg-white px-3 font-normal"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              <option value="changed_mind">Changed my mind</option>
              <option value="wrong_item">Wrong item received</option>
              <option value="damaged">Damaged item</option>
              <option value="missing_item">Missing item</option>
              <option value="not_as_expected">Not as expected</option>
              <option value="delivery_issue">Delivery issue</option>
            </select>
          </label>
          {open !== "cancel" && (
            <label className="mt-4 block text-sm font-bold">
              Evidence photos (optional)
              <span className="mt-1 block text-xs font-normal text-muted">
                Up to 8 JPG, PNG, or WebP images, 8 MB each. Photos are especially helpful for damaged or missing items.
              </span>
              <input
                className="mt-2 block min-h-12 w-full rounded-xl border border-[#E6E8EC] bg-white p-3 text-sm font-normal"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 8))}
              />
            </label>
          )}
          <label className="mt-4 block text-sm font-bold">
            Anything we should know?
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-[#E6E8EC] p-3 font-normal"
              maxLength={2000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          <div className="mt-4 flex gap-3">
            <button
              disabled={pending}
              onClick={submit}
              className="min-h-11 rounded-[14px] bg-ink px-5 text-sm font-bold text-white disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit request"}
            </button>
            <button
              onClick={() => setOpen(null)}
              className="min-h-11 px-4 text-sm font-bold"
            >
              Keep order
            </button>
          </div>
        </div>
      )}
      {data?.requests?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-display text-xl font-bold text-ink">
            Request progress
          </h3>
          <div className="mt-3 space-y-3">
            {data.requests.map((request: any) => (
              <article key={request.id} className="rounded-[18px] bg-white p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong>{request.request_number}</strong>
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-ink">
                    {statusLabels[request.status] || request.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {requestTypeLabel(request.type)} ·{" "}
                  {new Date(request.submitted_at).toLocaleDateString()}
                </p>
                <ol className="mt-3 border-l-2 border-mint pl-4">
                  {request.history?.map((entry: any) => (
                    <li key={entry.id} className="mb-2 text-sm">
                      <span className="font-bold">
                        {statusLabels[entry.to_status] || entry.to_status}
                      </span>
                      <span className="ml-2 text-muted">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                      {entry.public_note && (
                        <span className="mt-1 block text-muted">
                          {entry.public_note}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                {request.customer_message && (
                  <p className="mt-3 rounded-[14px] bg-cream p-3 text-sm text-ink">
                    <strong>Message from PetBoxNest:</strong>{" "}
                    {request.customer_message}
                  </p>
                )}
                {request.status === "pending_review" && (
                  <button
                    disabled={pending}
                    onClick={() =>
                      window.confirm("Cancel this request?") &&
                      cancelRequest(request.id)
                    }
                    className="mt-2 min-h-11 text-sm font-bold text-[#B5403C] underline underline-offset-4"
                  >
                    Cancel request
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
