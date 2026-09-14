"use client"

import {
  createStorefrontErrorId,
  reportStorefrontRouteError,
} from "@lib/util/storefront-error"
import { useEffect, useRef } from "react"
import Link from "next/link"
import "styles/globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const errorId = useRef(createStorefrontErrorId(error, "root"))

  useEffect(() => {
    void reportStorefrontRouteError({
      error,
      errorId: errorId.current,
      scope: "root",
    })
  }, [error])

  return (
    <html lang="en" data-mode="light">
      <body>
        <title>Something went wrong | PetBoxNest</title>
        <main className="grid min-h-screen place-items-center bg-cream px-4 py-12 text-ink">
          <section
            className="w-full max-w-[720px] rounded-[28px] border border-grey-20 bg-white p-7 shadow-[0_8px_24px_rgba(32,36,51,0.06)] small:p-12"
            role="alert"
            aria-labelledby="global-error-heading"
          >
            <Link
              href="/"
              className="pbn-focus inline-block rounded-lg font-display text-2xl font-extrabold tracking-[-0.04em] text-ink"
            >
              PetBox<span className="text-brand">Nest</span>
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-brand">
              The nest needs a quick reset
            </p>
            <h1
              id="global-error-heading"
              className="mt-2 font-display text-[36px] font-bold leading-tight tracking-[-0.04em] small:text-[48px]"
            >
              Something didn’t load.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Your shopping session is still safe. Try again, or return home and
              continue browsing.
            </p>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.08em] text-muted">
              Support reference: {errorId.current}
              {error.digest ? ` · ${error.digest}` : ""}
            </p>
            <div className="mt-7 flex flex-col gap-3 xsmall:flex-row">
              <button
                type="button"
                onClick={reset}
                className="pbn-primary-button w-full xsmall:w-auto"
              >
                Try again
              </button>
              <Link
                href="/"
                className="pbn-secondary-button w-full xsmall:w-auto"
              >
                Return home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
