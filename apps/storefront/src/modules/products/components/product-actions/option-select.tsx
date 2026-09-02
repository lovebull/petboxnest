import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const filteredOptions = (option.values ?? []).map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm font-bold text-ink">Select {title}</span>
      <div
        className="flex flex-wrap gap-2"
        data-testid={dataTestId}
        role="group"
        aria-label={`Select ${title}`}
      >
        {filteredOptions.map((v) => {
          return (
            <button
              type="button"
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "pbn-focus min-h-12 min-w-[72px] rounded-[12px] border-2 bg-white px-4 py-2 text-sm font-semibold text-ink transition duration-150 disabled:cursor-not-allowed disabled:opacity-50",
                {
                  "border-brand bg-brand/5 text-brand-dark": v === current,
                  "border-grey-20 hover:border-brand/50 hover:bg-mist":
                    v !== current,
                }
              )}
              disabled={disabled}
              aria-pressed={v === current}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
