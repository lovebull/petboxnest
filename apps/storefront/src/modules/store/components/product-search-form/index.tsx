"use client"

import { FormEvent, useEffect, useId, useState } from "react"
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation"

import { SEARCH_QUERY_KEY } from "@lib/util/catalog-filters"

type ProductSearchFormProps = {
  initialQuery?: string
  placeholder?: string
  targetPath?: string
  preserveParams?: boolean
  variant?: "nav" | "catalog" | "mobile"
  className?: string
  onSearch?: () => void
}

export default function ProductSearchForm({
  initialQuery = "",
  placeholder = "Search products, SKU, category",
  targetPath,
  preserveParams = false,
  variant = "catalog",
  className = "",
  onSearch,
}: ProductSearchFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { countryCode } = useParams() as { countryCode?: string }
  const [query, setQuery] = useState(initialQuery)
  const inputId = useId()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  const resolvePath = () => {
    if (!targetPath) {
      return pathname
    }

    return countryCode ? `/${countryCode}${targetPath}` : targetPath
  }

  const navigateWithQuery = (nextQuery: string) => {
    const params = preserveParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams()

    const trimmedQuery = nextQuery.trim()

    if (trimmedQuery) {
      params.set(SEARCH_QUERY_KEY, trimmedQuery)
    } else {
      params.delete(SEARCH_QUERY_KEY)
    }

    params.delete("page")

    const queryString = params.toString()
    router.push(queryString ? `${resolvePath()}?${queryString}` : resolvePath())
    onSearch?.()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigateWithQuery(query)
  }

  const handleClear = () => {
    setQuery("")
    navigateWithQuery("")
  }

  const isNav = variant === "nav"

  return (
    <form
      role="search"
      aria-label="Search products"
      onSubmit={handleSubmit}
      className={`${className} ${
        isNav
          ? "relative flex min-h-11 w-[250px] items-center rounded-circle border border-grey-20 bg-mist px-3"
          : "rounded-[20px] border border-grey-20 bg-cream p-3"
      }`}
    >
      <label className="sr-only" htmlFor={inputId}>
        Search products
      </label>
      <div className={isNav ? "flex w-full items-center gap-2" : "flex gap-2"}>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={`pbn-focus min-h-11 min-w-0 flex-1 rounded-circle border-0 bg-transparent text-sm font-semibold text-ink placeholder:text-muted ${
            isNav ? "px-1" : "px-3"
          }`}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="pbn-focus min-h-10 rounded-circle px-2 text-xs font-bold text-muted hover:text-brand"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          className={
            isNav
              ? "pbn-focus min-h-10 rounded-circle bg-brand px-3 text-xs font-bold text-white hover:bg-brand-dark"
              : "pbn-primary-button min-h-11 px-4 text-sm"
          }
        >
          Search
        </button>
      </div>
    </form>
  )
}
