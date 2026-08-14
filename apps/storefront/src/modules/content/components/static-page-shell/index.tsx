import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { ReactNode } from "react"

type StaticPageShellProps = {
  eyebrow: string
  title: string
  intro: string
  updated?: string
  children: ReactNode
}

export function StaticPageShell({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: StaticPageShellProps) {
  return (
    <article className="bg-[#f7f3e7] text-ui-fg-base">
      <header className="border-b border-[#ded8c8]">
        <div className="content-container py-16 small:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ui-fg-muted">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-serif text-[42px] font-normal leading-[1.05] tracking-[-0.03em] small:text-[72px]">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-ui-fg-subtle small:text-lg small:leading-8">
            {intro}
          </p>
          {updated && (
            <p className="mt-6 text-xs uppercase tracking-[0.14em] text-ui-fg-muted">
              Last updated {updated}
            </p>
          )}
        </div>
      </header>

      <div className="content-container grid gap-12 py-14 small:grid-cols-[240px_minmax(0,760px)] small:justify-between small:py-24">
        <aside className="small:sticky small:top-32 small:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ui-fg-base">
            Need help?
          </p>
          <p className="mt-3 max-w-[230px] text-sm leading-6 text-ui-fg-subtle">
            Our customer care team can help with orders, products, and policy
            questions.
          </p>
          <LocalizedClientLink
            href="/contact"
            className="mt-5 inline-flex min-h-11 items-center border-b border-ui-fg-base text-sm font-medium transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Contact us
          </LocalizedClientLink>
        </aside>

        <div className="space-y-12 text-[15px] leading-7 text-ui-fg-subtle small:text-base small:leading-8">
          {children}
        </div>
      </div>
    </article>
  )
}

export function PolicySection({
  title,
  children,
  id,
}: {
  title: string
  children: ReactNode
  id?: string
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-[#ded8c8] pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-serif text-[30px] font-normal leading-tight tracking-[-0.02em] text-ui-fg-base small:text-[36px]">
        {title}
      </h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

export function BulletList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-ui-fg-muted">{children}</ul>
}
