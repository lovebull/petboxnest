import {
  ChatBubble,
  CheckCircle,
  ShieldCheck,
  TruckFast,
} from "@medusajs/icons"

const items = [
  { label: "Shipping details up front", icon: TruckFast },
  { label: "Straightforward policies", icon: CheckCircle },
  { label: "Secure checkout", icon: ShieldCheck },
  { label: "Support when you need it", icon: ChatBubble },
]

const TrustStrip = () => (
  <section
    aria-label="Shopping reassurance"
    className="border-y border-[#E6E8EC] bg-white"
  >
    <div className="pbn-container grid grid-cols-2 gap-x-4 gap-y-5 py-6 small:grid-cols-4 small:py-7">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="flex items-center gap-3 text-sm font-semibold text-ink"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-brand">
              <Icon aria-hidden="true" />
            </span>
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  </section>
)

export default TrustStrip
