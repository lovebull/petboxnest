"use client"

import Image from "next/image"
import type { Hit as HitType } from "instantsearch.js"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

export type ProductHit = HitType<{
  title: string | null
  handle: string | null
  thumbnail: string | null
}>

const SearchHit = ({
  hit,
  onNavigate,
}: {
  hit: ProductHit
  onNavigate?: () => void
}) => {
  if (!hit.handle) {
    return null
  }

  return (
    <li>
      <LocalizedClientLink
        href={`/products/${hit.handle}`}
        onClick={onNavigate}
        className="pbn-focus group flex min-h-[88px] items-center gap-4 rounded-[18px] border border-transparent bg-white px-3 py-3 hover:border-brand/25"
        data-testid="search-hit-link"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[14px] border border-grey-20 bg-mist">
          {hit.thumbnail ? (
            <Image
              src={hit.thumbnail}
              alt=""
              fill
              sizes="64px"
              className="object-contain object-center"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted">
              <PlaceholderImage size={20} />
            </div>
          )}
        </div>
        <span className="line-clamp-2 text-sm font-bold leading-5 text-ink group-hover:text-brand">
          {hit.title}
        </span>
      </LocalizedClientLink>
    </li>
  )
}

export default SearchHit
