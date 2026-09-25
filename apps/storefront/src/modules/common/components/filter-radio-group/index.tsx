import { Label, RadioGroup } from "@modules/common/components/ui"
type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex flex-col gap-y-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
        {title}
      </h3>
      <RadioGroup className="grid gap-2" data-testid={dataTestId}>
        {items?.map((i) => (
          <div key={i.value}>
            <RadioGroup.Item
              checked={i.value === value}
              onChange={() => handleChange(i.value)}
              className="hidden peer"
              id={i.value}
              value={i.value}
            />
            <Label
              htmlFor={i.value}
              className="pbn-focus flex min-h-10 cursor-pointer items-center rounded-circle border border-grey-20 bg-cream px-3 text-sm font-bold text-ink transition peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white hover:border-brand/60"
              data-testid="radio-label"
              data-active={i.value === value}
            >
              {i.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
