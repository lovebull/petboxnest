"use client"

import { clx } from "@modules/common/components/ui"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function Pagination({
  page,
  totalPages,
  "data-testid": dataTestid,
}: {
  page: number
  totalPages: number
  "data-testid"?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const arrayRange = (start: number, stop: number) =>
    Array.from({ length: stop - start + 1 }, (_, index) => start + index)

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", newPage.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  const renderPageButton = (
    p: number,
    label: string | number,
    isCurrent: boolean
  ) => (
    <button
      key={p}
      className={clx(
        "pbn-focus grid min-h-11 min-w-11 place-items-center rounded-circle border border-grey-20 bg-white px-3 text-sm font-bold text-ink transition hover:border-brand/60",
        {
          "border-brand bg-brand text-white hover:border-brand": isCurrent,
        }
      )}
      aria-current={isCurrent ? "page" : undefined}
      aria-label={`Go to page ${label}`}
      disabled={isCurrent}
      onClick={() => handlePageChange(p)}
    >
      {label}
    </button>
  )

  const renderEllipsis = (key: string) => (
    <span
      key={key}
      className="grid min-h-11 min-w-8 place-items-center text-sm font-bold text-muted"
    >
      ...
    </span>
  )

  const renderPageButtons = () => {
    const buttons = []

    if (totalPages <= 7) {
      buttons.push(
        ...arrayRange(1, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else if (page <= 4) {
      buttons.push(
        ...arrayRange(1, 5).map((p) => renderPageButton(p, p, p === page))
      )
      buttons.push(renderEllipsis("ellipsis1"))
      buttons.push(renderPageButton(totalPages, totalPages, totalPages === page))
    } else if (page >= totalPages - 3) {
      buttons.push(renderPageButton(1, 1, 1 === page))
      buttons.push(renderEllipsis("ellipsis2"))
      buttons.push(
        ...arrayRange(totalPages - 4, totalPages).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
    } else {
      buttons.push(renderPageButton(1, 1, 1 === page))
      buttons.push(renderEllipsis("ellipsis3"))
      buttons.push(
        ...arrayRange(page - 1, page + 1).map((p) =>
          renderPageButton(p, p, p === page)
        )
      )
      buttons.push(renderEllipsis("ellipsis4"))
      buttons.push(renderPageButton(totalPages, totalPages, totalPages === page))
    }

    return buttons
  }

  return (
    <nav
      className="mt-12 flex w-full justify-center"
      aria-label="Product pages"
    >
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        data-testid={dataTestid}
      >
        {renderPageButtons()}
      </div>
    </nav>
  )
}
