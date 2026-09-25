import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type React from "react"

type CatalogBreadcrumb = {
  label: string
  href?: string
}

type CatalogPageShellProps = {
  eyebrow: string
  title: string
  description: string
  currentLabel: string
  breadcrumbs?: CatalogBreadcrumb[]
  children: React.ReactNode
  refinement: React.ReactNode
  subnav?: CatalogBreadcrumb[]
}

export default function CatalogPageShell({
  eyebrow,
  title,
  description,
  currentLabel,
  breadcrumbs = [],
  children,
  refinement,
  subnav = [],
}: CatalogPageShellProps) {
  return (
    <main className="bg-cream text-ink" data-testid="category-container">
      <section className="border-b border-grey-20">
        <div className="pbn-container py-12 small:py-16 medium:py-20">
          {breadcrumbs.length > 0 && (
            <nav
              className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-muted"
              aria-label="Catalog breadcrumb"
            >
              {breadcrumbs.map((item, index) => (
                <span key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {item.href ? (
                    <LocalizedClientLink
                      href={item.href}
                      className="pbn-focus rounded-base hover:text-brand"
                    >
                      {item.label}
                    </LocalizedClientLink>
                  ) : (
                    <span className="text-ink">{item.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span aria-hidden="true">/</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <div className="grid gap-8 small:grid-cols-[minmax(0,1fr)_360px] small:items-end medium:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              <p className="inline-flex rounded-circle bg-mint px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-ink">
                {eyebrow}
              </p>
              <h1
                className="mt-5 max-w-[850px] font-display text-[42px] font-bold leading-[1.02] tracking-[-0.04em] xsmall:text-[54px] small:text-[70px]"
                data-testid="store-page-title"
              >
                {title}
              </h1>
              <p className="mt-5 max-w-[680px] text-base leading-8 text-muted xsmall:text-lg">
                {description}
              </p>
            </div>
            <aside className="rounded-[28px] bg-white p-5 shadow-[0_16px_40px_rgba(32,36,51,0.08)] xsmall:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                Current browse
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-ink">
                {currentLabel}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Use filters to narrow by pet, price, availability, and product options.
              </p>
            </aside>
          </div>

          {subnav.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {subnav.map((item) =>
                item.href ? (
                  <LocalizedClientLink
                    key={item.href}
                    href={item.href}
                    className="pbn-focus inline-flex min-h-11 items-center rounded-circle border border-grey-20 bg-white px-4 text-sm font-bold text-ink hover:border-brand/60"
                  >
                    {item.label}
                  </LocalizedClientLink>
                ) : (
                  <span
                    key={item.label}
                    className="inline-flex min-h-11 items-center rounded-circle bg-brand px-4 text-sm font-bold text-white"
                  >
                    {item.label}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-mist py-10 small:py-14 medium:py-16">
        <div className="pbn-container grid gap-7 small:grid-cols-[280px_minmax(0,1fr)] small:items-start medium:grid-cols-[320px_minmax(0,1fr)] medium:gap-10">
          {refinement}
          <div className="min-w-0 rounded-[28px] border border-grey-20 bg-white p-4 shadow-[0_8px_24px_rgba(32,36,51,0.05)] xsmall:p-6 small:p-8">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}
