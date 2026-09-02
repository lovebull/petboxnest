"use client"

import { CheckCircleSolid } from "@medusajs/icons"
import { useSearchParams } from "next/navigation"

const checkoutSteps = [
  { id: "address", label: "Address" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
] as const

const CheckoutProgress = () => {
  const searchParams = useSearchParams()
  const currentStep = searchParams.get("step") || "address"
  const currentIndex = Math.max(
    checkoutSteps.findIndex((step) => step.id === currentStep),
    0
  )

  return (
    <nav aria-label="Checkout progress" className="mt-7">
      <ol className="grid grid-cols-4 gap-2">
        {checkoutSteps.map((step, index) => {
          const isCurrent = index === currentIndex
          const isComplete = index < currentIndex

          return (
            <li key={step.id} className="min-w-0">
              <div
                className={`h-1.5 rounded-full transition-colors duration-200 ${
                  index <= currentIndex ? "bg-brand" : "bg-white/70"
                }`}
                aria-hidden="true"
              />
              <div
                className={`mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] xsmall:text-xs ${
                  isCurrent || isComplete ? "text-ink" : "text-muted"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${
                    isCurrent
                      ? "bg-brand text-white"
                      : isComplete
                      ? "bg-mint text-ink"
                      : "bg-white text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {isComplete ? <CheckCircleSolid /> : index + 1}
                </span>
                <span className="truncate">{step.label}</span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default CheckoutProgress
