"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import type React from "react"

import {
  AVAILABILITY_FILTER_QUERY_KEY,
  PRICE_FILTER_QUERY_KEY,
  PET_FILTER_QUERY_KEY,
  parseCatalogFilters,
  petFilterOptions,
  priceFilterOptions,
} from "@lib/util/catalog-filters"
import {
  OPTION_VALUE_QUERY_KEY,
  parseOptionValueIds,
} from "@lib/util/product-option-filters"
import OptionsPicker from "./options-picker"
import SortProducts, { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  hideOptionsPicker?: boolean
  "data-testid"?: string
}

const RefinementList = ({
  sortBy,
  hideOptionsPicker = false,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const updateQueryParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      updater(params)

      params.delete("page")

      const queryString = params.toString()
      const currentQuery = searchParams.toString()
      const nextPath = queryString ? `${pathname}?${queryString}` : pathname
      const currentPath = currentQuery
        ? `${pathname}?${currentQuery}`
        : pathname

      if (nextPath !== currentPath) {
        router.push(nextPath)
      }
    },
    [pathname, router, searchParams]
  )

  const setQueryParams = (name: string, value: string) =>
    updateQueryParams((params) => params.set(name, value))

  const toggleQueryParam = (name: string, value: string) =>
    updateQueryParams((params) => {
      if (params.get(name) === value) {
        params.delete(name)
      } else {
        params.set(name, value)
      }
    })

  const clearQueryParam = (name: string) =>
    updateQueryParams((params) => params.delete(name))

  const clearAllFilters = () =>
    updateQueryParams((params) => {
      params.delete("sortBy")
      params.delete(PET_FILTER_QUERY_KEY)
      params.delete(PRICE_FILTER_QUERY_KEY)
      params.delete(AVAILABILITY_FILTER_QUERY_KEY)
      params.delete(OPTION_VALUE_QUERY_KEY)
    })

  const selectedOptionValueIds = useMemo(
    () => parseOptionValueIds(searchParams),
    [searchParams]
  )
  const catalogFilters = useMemo(
    () => parseCatalogFilters(searchParams),
    [searchParams]
  )

  const setOptionValueIds = (valueIds: string[]) =>
    updateQueryParams((params) => {
      params.delete(OPTION_VALUE_QUERY_KEY)
      valueIds.forEach((valueId) =>
        params.append(OPTION_VALUE_QUERY_KEY, valueId)
      )
    })

  const activeFilters = [
    ...(catalogFilters.pet
      ? [
          {
            key: PET_FILTER_QUERY_KEY,
            label:
              petFilterOptions.find(
                (option) => option.value === catalogFilters.pet
              )?.label || "Pet",
          },
        ]
      : []),
    ...(catalogFilters.price
      ? [
          {
            key: PRICE_FILTER_QUERY_KEY,
            label:
              priceFilterOptions.find(
                (option) => option.value === catalogFilters.price
              )?.label || "Price",
          },
        ]
      : []),
    ...(catalogFilters.availability
      ? [{ key: AVAILABILITY_FILTER_QUERY_KEY, label: "In stock" }]
      : []),
    ...(selectedOptionValueIds.length
      ? [
          {
            key: OPTION_VALUE_QUERY_KEY,
            label: `${selectedOptionValueIds.length} option ${
              selectedOptionValueIds.length === 1 ? "filter" : "filters"
            }`,
          },
        ]
      : []),
  ]

  const activeCount = activeFilters.length + (sortBy !== "created_at" ? 1 : 0)
  const panel = (
    <FilterPanel
      sortBy={sortBy}
      dataTestId={dataTestId}
      hideOptionsPicker={hideOptionsPicker}
      selectedOptionValueIds={selectedOptionValueIds}
      activeFilters={activeFilters}
      catalogFilters={catalogFilters}
      setQueryParams={setQueryParams}
      toggleQueryParam={toggleQueryParam}
      clearQueryParam={clearQueryParam}
      clearAllFilters={clearAllFilters}
      setOptionValueIds={setOptionValueIds}
    />
  )

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 small:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="pbn-focus inline-flex min-h-12 items-center rounded-[14px] border border-grey-20 bg-white px-5 text-sm font-bold text-ink shadow-[0_8px_24px_rgba(32,36,51,0.06)]"
        >
          Filters
          {activeCount > 0 && (
            <span className="ml-2 rounded-circle bg-brand px-2 py-0.5 text-xs text-white">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="pbn-focus min-h-11 rounded-[12px] px-3 text-sm font-bold text-brand hover:text-brand-dark"
          >
            Clear all
          </button>
        )}
      </div>

      <aside className="hidden small:block small:min-w-[280px] medium:min-w-[320px]">
        <div className="small:sticky small:top-28">{panel}</div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 small:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
        >
          <button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="Close filters"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(90vw,420px)] flex-col overflow-y-auto bg-cream p-5 shadow-[0_16px_40px_rgba(32,36,51,0.18)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Browse controls
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                  Filters
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="pbn-focus grid h-11 w-11 place-items-center rounded-[14px] bg-white text-sm font-bold text-ink"
                aria-label="Close filters"
              >
                Close
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="pbn-primary-button mt-6 w-full"
            >
              Show products
            </button>
          </div>
        </div>
      )}
    </>
  )
}

type ActiveFilter = { key: string; label: string }

function FilterPanel({
  sortBy,
  dataTestId,
  hideOptionsPicker,
  selectedOptionValueIds,
  activeFilters,
  catalogFilters,
  setQueryParams,
  toggleQueryParam,
  clearQueryParam,
  clearAllFilters,
  setOptionValueIds,
}: {
  sortBy: SortOptions
  dataTestId?: string
  hideOptionsPicker: boolean
  selectedOptionValueIds: string[]
  activeFilters: ActiveFilter[]
  catalogFilters: ReturnType<typeof parseCatalogFilters>
  setQueryParams: (name: string, value: string) => void
  toggleQueryParam: (name: string, value: string) => void
  clearQueryParam: (name: string) => void
  clearAllFilters: () => void
  setOptionValueIds: (valueIds: string[]) => void
}) {
  return (
    <div className="rounded-[24px] border border-grey-20 bg-white p-5 shadow-[0_8px_24px_rgba(32,36,51,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Refine
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">
            Find their fit
          </h2>
        </div>
        {(activeFilters.length > 0 || sortBy !== "created_at") && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="pbn-focus min-h-10 rounded-[12px] px-2 text-xs font-bold text-brand hover:text-brand-dark"
          >
            Clear
          </button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Active filters">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => clearQueryParam(filter.key)}
              className="pbn-focus inline-flex min-h-9 items-center rounded-circle bg-mint px-3 text-xs font-bold text-ink"
            >
              {filter.label}
              <span className="ml-2" aria-hidden="true">
                x
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-7 space-y-8">
        <SortProducts
          sortBy={sortBy}
          setQueryParams={setQueryParams}
          data-testid={dataTestId}
        />

        <FilterGroup title="Shop by pet">
          {petFilterOptions.map((option) => (
            <FilterButton
              key={option.value}
              label={option.label}
              selected={catalogFilters.pet === option.value}
              onClick={() => toggleQueryParam(PET_FILTER_QUERY_KEY, option.value)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Price">
          {priceFilterOptions.map((option) => (
            <FilterButton
              key={option.value}
              label={option.label}
              selected={catalogFilters.price === option.value}
              onClick={() =>
                toggleQueryParam(PRICE_FILTER_QUERY_KEY, option.value)
              }
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Availability">
          <FilterButton
            label="In stock"
            selected={catalogFilters.availability === "in_stock"}
            onClick={() =>
              toggleQueryParam(AVAILABILITY_FILTER_QUERY_KEY, "in_stock")
            }
          />
        </FilterGroup>

        {!hideOptionsPicker && (
          <OptionsPicker
            selectedValueIds={selectedOptionValueIds}
            setOptionValueIds={setOptionValueIds}
          />
        )}
      </div>
    </div>
  )
}

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
        {title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function FilterButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`pbn-focus min-h-10 rounded-circle border px-3 text-sm font-bold transition ${
        selected
          ? "border-brand bg-brand text-white"
          : "border-grey-20 bg-cream text-ink hover:border-brand/60"
      }`}
    >
      {label}
    </button>
  )
}

export default RefinementList
