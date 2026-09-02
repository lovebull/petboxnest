import { Text, clx } from "@modules/common/components/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize: _headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable: _triggerable,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "group border-t border-grey-20 last:mb-0 last:border-b",
        className
      )}
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="pbn-focus flex min-h-14 w-full items-center justify-between rounded-base py-3 text-left">
          <div className="flex flex-col">
            <Text className="text-sm font-bold text-ink">{title}</Text>
            {subtitle && (
              <Text as="span" className="mt-1 text-sm text-muted">
                {subtitle}
              </Text>
            )}
          </div>
          {customTrigger || <MorphingTrigger />}
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open radix-state-closed:pointer-events-none"
        )}
      >
        <div className="inter-base-regular group-radix-state-closed:animate-accordion-close">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="group relative rounded-rounded bg-mist p-[6px] text-ink transition-colors group-hover:bg-mint/50">
      <div className="h-5 w-5">
        <span className="absolute inset-y-[31.75%] left-[48%] right-1/2 w-[1.5px] rounded-circle bg-brand duration-300 group-radix-state-open:rotate-90" />
        <span className="absolute inset-x-[31.75%] bottom-1/2 top-[48%] h-[1.5px] rounded-circle bg-brand duration-300 group-radix-state-open:left-1/2 group-radix-state-open:right-1/2 group-radix-state-open:rotate-90" />
      </div>
    </div>
  )
}

export default Accordion
