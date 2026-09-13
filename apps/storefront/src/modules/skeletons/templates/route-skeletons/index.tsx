import type { ReactNode } from "react"

const blockClass =
  "rounded-[18px] bg-grey-10 motion-safe:animate-pulse motion-reduce:animate-none"

function LoadingFrame({
  label,
  children,
  className = "bg-cream",
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className} aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

function ProductCards({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3 medium:grid-cols-4 small:gap-x-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} aria-hidden="true">
          <div className={`${blockClass} aspect-[4/5] w-full bg-mist`} />
          <div className={`${blockClass} mt-4 h-4 w-4/5`} />
          <div className={`${blockClass} mt-3 h-4 w-2/5`} />
        </div>
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="sticky inset-x-0 top-0 z-50" aria-hidden="true">
      <div className="h-9 bg-brand/90" />
      <div className="h-[72px] border-b border-grey-20 bg-white small:h-20">
        <div className="pbn-container flex h-full items-center justify-between gap-5">
          <div className={`${blockClass} h-4 w-24`} />
          <div className={`${blockClass} h-7 w-36 bg-mint`} />
          <div className={`${blockClass} h-4 w-28`} />
        </div>
      </div>
    </div>
  )
}

export function MainPageSkeleton() {
  return (
    <LoadingFrame label="Loading page">
      <div className="pbn-container py-10 small:py-16">
        <div className="rounded-[24px] bg-mint/70 p-6 small:rounded-[32px] small:p-12">
          <div className={`${blockClass} h-4 w-28 bg-white/70`} />
          <div className={`${blockClass} mt-6 h-12 max-w-xl bg-white/80`} />
          <div className={`${blockClass} mt-4 h-5 max-w-2xl bg-white/70`} />
          <div className={`${blockClass} mt-8 h-12 w-40 bg-brand/30`} />
        </div>
        <div className="mt-10 grid gap-5 small:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className={`${blockClass} h-44 bg-white`} />
          ))}
        </div>
      </div>
    </LoadingFrame>
  )
}

export function ProductListingSkeleton() {
  return (
    <LoadingFrame label="Loading products">
      <div className="pbn-container grid gap-8 py-8 small:grid-cols-[220px_minmax(0,1fr)] small:py-12">
        <aside className="hidden space-y-4 small:block" aria-hidden="true">
          <div className={`${blockClass} h-6 w-28`} />
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`${blockClass} h-11 w-full bg-white`} />
          ))}
        </aside>
        <div>
          <div className={`${blockClass} mb-8 h-10 w-52`} />
          <ProductCards />
        </div>
      </div>
    </LoadingFrame>
  )
}

export function ProductDetailSkeleton() {
  return (
    <LoadingFrame label="Loading product details">
      <div className="pbn-container grid gap-8 py-8 small:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.85fr)] small:py-14">
        <div
          className={`${blockClass} aspect-square bg-mist small:aspect-[4/3]`}
        />
        <div className="rounded-[24px] border border-grey-20 bg-white p-6 small:p-8">
          <div className={`${blockClass} h-4 w-24`} />
          <div className={`${blockClass} mt-5 h-12 w-4/5`} />
          <div className={`${blockClass} mt-5 h-7 w-28 bg-mint`} />
          <div className={`${blockClass} mt-8 h-14 w-full`} />
          <div className={`${blockClass} mt-4 h-14 w-full bg-brand/30`} />
          <div className={`${blockClass} mt-8 h-32 w-full`} />
        </div>
      </div>
    </LoadingFrame>
  )
}

export function ArticleListingSkeleton() {
  return (
    <LoadingFrame label="Loading articles">
      <div className="pbn-container py-12 small:py-20">
        <div className={`${blockClass} mx-auto h-4 w-32 bg-mint`} />
        <div className={`${blockClass} mx-auto mt-5 h-14 max-w-xl`} />
        <div className="mt-12 grid gap-7 small:grid-cols-2 medium:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} aria-hidden="true">
              <div className={`${blockClass} aspect-[16/10] bg-mist`} />
              <div className={`${blockClass} mt-5 h-4 w-24`} />
              <div className={`${blockClass} mt-3 h-7 w-4/5`} />
            </div>
          ))}
        </div>
      </div>
    </LoadingFrame>
  )
}

export function ArticleDetailSkeleton() {
  return (
    <LoadingFrame label="Loading article">
      <div className="pbn-container py-12 small:py-20">
        <div className={`${blockClass} mx-auto h-4 w-32 bg-mint`} />
        <div className={`${blockClass} mx-auto mt-7 h-16 max-w-3xl`} />
        <div className={`${blockClass} mx-auto mt-5 h-5 max-w-xl`} />
        <div className={`${blockClass} mt-12 aspect-[16/9] w-full bg-mist`} />
        <div className="mx-auto mt-10 max-w-[820px] rounded-[24px] bg-white p-7 small:p-12">
          {["w-full", "w-11/12", "w-full", "w-4/5", "w-full"].map(
            (width, index) => (
              <div key={index} className={`${blockClass} ${width} mb-4 h-5`} />
            ),
          )}
        </div>
      </div>
    </LoadingFrame>
  )
}

export function AccountPageSkeleton() {
  return (
    <LoadingFrame label="Loading account" className="bg-white">
      <div className="grid gap-6 small:grid-cols-[240px_minmax(0,1fr)]">
        <div className={`${blockClass} h-72 bg-mist`} />
        <div className="space-y-5">
          <div className={`${blockClass} h-10 w-56`} />
          {[0, 1, 2].map((item) => (
            <div key={item} className={`${blockClass} h-28 bg-mist`} />
          ))}
        </div>
      </div>
    </LoadingFrame>
  )
}
