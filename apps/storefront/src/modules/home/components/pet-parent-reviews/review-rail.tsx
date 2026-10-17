"use client"

import { CheckCircle, ChevronLeft, ChevronRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCallback, useEffect, useRef, useState } from "react"

export type PetParentVoice = {
  id: string
  name: string
  title: string
  content: string
  rating?: number
  dateLabel?: string
  trustLabel?: string
  isEditorial?: boolean
  product?: {
    title: string
    handle: string
  } | null
}

type ReviewRailProps = {
  voices: PetParentVoice[]
}

const ReviewRail = ({ voices }: ReviewRailProps) => {
  const railRef = useRef<HTMLDivElement>(null)
  const [canScrollBack, setCanScrollBack] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(false)

  const updateControls = useCallback(() => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    setCanScrollBack(rail.scrollLeft > 4)
    setCanScrollForward(
      rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4,
    )
  }, [])

  useEffect(() => {
    updateControls()
    window.addEventListener("resize", updateControls)

    return () => window.removeEventListener("resize", updateControls)
  }, [updateControls])

  const move = (direction: -1 | 1) => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    rail.scrollBy({
      left: direction * Math.max(280, rail.clientWidth * 0.8),
      behavior: "smooth",
    })
  }

  return (
    <div className="relative mt-10">
      <div
        ref={railRef}
        onScroll={updateControls}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-0.5 pb-2"
        aria-label="Customer review highlights"
      >
        {voices.map((voice, index) => (
          <article
            key={voice.id}
            className="flex min-h-[300px] min-w-[86%] snap-start flex-col rounded-lg border border-brand/15 bg-white p-6 shadow-[0_10px_28px_rgba(32,36,51,0.07)] xsmall:min-w-[58%] small:min-w-[calc((100%-40px)/3)] small:p-7 medium:min-w-[calc((100%-60px)/4)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-bold leading-tight text-ink">
                  {voice.name}
                </p>
                {typeof voice.rating === "number" ? (
                  <p
                    className="mt-2 text-lg tracking-normal text-yellow"
                    aria-label={`${voice.rating} out of 5 stars`}
                  >
                    {"★".repeat(voice.rating)}
                    <span className="text-grey-20">
                      {"★".repeat(5 - voice.rating)}
                    </span>
                  </p>
                ) : (
                  <span className="mt-3 block h-1.5 w-10 rounded-full bg-yellow" />
                )}
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint/45 text-brand">
                <span
                  className="font-display text-xl font-bold"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </span>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-normal text-brand">
              <CheckCircle aria-hidden="true" className="h-4 w-4 text-brand" />
              {voice.trustLabel || "Customer review"}
            </div>

            <h3 className="mt-4 text-lg font-bold leading-6 text-ink">
              {voice.title}
            </h3>
            {voice.isEditorial ? (
              <p className="mt-3 flex-1 text-[15px] leading-7 text-muted">
                {voice.content}
              </p>
            ) : (
              <blockquote className="mt-3 flex-1 text-[15px] leading-7 text-muted">
                “{voice.content}”
              </blockquote>
            )}

            <footer className="mt-6 border-t border-grey-20 pt-4 text-xs leading-5 text-muted">
              {voice.product?.handle ? (
                <LocalizedClientLink
                  href={`/products/${voice.product.handle}`}
                  className="pbn-focus block rounded-md font-bold text-ink hover:text-brand"
                >
                  {voice.product.title}
                </LocalizedClientLink>
              ) : (
                <span className="font-bold text-ink">Pet parent</span>
              )}
              {voice.dateLabel && (
                <time className="mt-1 block">{voice.dateLabel}</time>
              )}
            </footer>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!canScrollBack}
          aria-label="Show previous reviews"
          className="pbn-focus grid h-12 w-12 place-items-center rounded-full border-2 border-brand bg-white text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:border-grey-20 disabled:text-grey-30"
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!canScrollForward}
          aria-label="Show more reviews"
          className="pbn-focus grid h-12 w-12 place-items-center rounded-full border-2 border-brand bg-white text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:border-grey-20 disabled:text-grey-30"
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default ReviewRail
