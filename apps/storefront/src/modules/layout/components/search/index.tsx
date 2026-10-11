"use client"

import { MagnifyingGlass } from "@medusajs/icons"
import { useCallback, useEffect, useRef, useState } from "react"
import type { SearchClient } from "instantsearch.js"
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch"

import useSearchSettled from "@lib/hooks/use-search-settled"
import useToggleState from "@lib/hooks/use-toggle-state"
import { PRODUCT_INDEX_NAME, searchClient } from "@lib/search-client"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SearchDrawer from "./drawer"
import SearchHit, { ProductHit } from "./hit"

const HITS_PER_PAGE = 8
const DEBOUNCE_MS = 300

const SearchPanel = ({ onNavigate }: { onNavigate: () => void }) => {
  const timer = useRef<number | undefined>(undefined)
  const queryHook = useCallback(
    (nextQuery: string, search: (value: string) => void) => {
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(
        () => search(nextQuery.trim().length >= 2 ? nextQuery : ""),
        DEBOUNCE_MS
      )
    },
    []
  )
  const { query, refine } = useSearchBox({ queryHook })
  const { items } = useHits<ProductHit>()
  const { status, error } = useInstantSearch()
  const { isSettled } = useSearchSettled()
  const [inputValue, setInputValue] = useState(query)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const hasInput = inputValue.trim().length >= 2
  const isPending = hasInput && inputValue.trim() !== query.trim()
  const hasResults = Boolean(query.trim()) && items.length > 0

  return (
    <>
      <div className="flex items-center gap-3 border-b border-grey-20 bg-white px-5">
        <MagnifyingGlass className="shrink-0 text-brand" />
        <input
          type="search"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
            refine(event.target.value)
          }}
          placeholder="Search products"
          aria-label="Search products"
          autoFocus
          className="pbn-focus min-h-14 w-full bg-transparent py-4 text-base font-semibold text-ink outline-none placeholder:text-muted"
          data-testid="search-input"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!hasInput ? (
          <div className="rounded-[20px] border border-dashed border-grey-30 bg-white px-5 py-10 text-center">
            <p className="font-display text-xl font-bold text-ink">
              What are you looking for?
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Enter at least two characters to search products, categories,
              options, and SKUs.
            </p>
          </div>
        ) : status === "error" ? (
          <p role="alert" className="px-4 py-8 text-center text-sm font-semibold text-danger">
            Search could not load{error?.message ? `: ${error.message}` : "."}
          </p>
        ) : !isSettled || isPending ? (
          <p role="status" className="px-4 py-8 text-center text-sm font-semibold text-muted">
            Searching…
          </p>
        ) : hasResults ? (
          <>
            <ul className="space-y-2" data-testid="search-results">
              {items.map((hit) => (
                <SearchHit key={hit.objectID} hit={hit} onNavigate={onNavigate} />
              ))}
            </ul>
            <LocalizedClientLink
              href={`/store?q=${encodeURIComponent(query.trim())}`}
              onClick={onNavigate}
              className="pbn-primary-button mt-5 flex w-full justify-center"
            >
              View all results
            </LocalizedClientLink>
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed border-grey-30 bg-white px-5 py-10 text-center">
            <p className="font-display text-xl font-bold text-ink">
              No matches found
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Check the spelling, try a broader phrase, or browse all products.
            </p>
            <LocalizedClientLink
              href="/store"
              onClick={onNavigate}
              className="pbn-secondary-button mt-5 inline-flex"
            >
              Browse all products
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </>
  )
}

const Search = () => {
  const { state: isOpen, open, close } = useToggleState()

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Search products"
        className="pbn-focus grid h-11 w-11 place-items-center rounded-[14px] hover:bg-cream hover:text-brand"
        data-testid="nav-search-button"
      >
        <MagnifyingGlass />
      </button>

      <SearchDrawer isOpen={isOpen} close={close}>
        <InstantSearch
          indexName={PRODUCT_INDEX_NAME}
          searchClient={searchClient as unknown as SearchClient}
          future={{ preserveSharedStateOnUnmount: true }}
        >
          <Configure hitsPerPage={HITS_PER_PAGE} />
          <SearchPanel onNavigate={close} />
        </InstantSearch>
      </SearchDrawer>
    </>
  )
}

export default Search
