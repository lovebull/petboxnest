import { Text } from "@modules/common/components/ui"

const MedusaCTA = () => {
  return (
    <Text className="flex items-center gap-x-1.5 text-[11px] leading-5">
      Powered by
      <a
        href="https://www.shopify.com"
        target="_blank"
        rel="noreferrer"
        className="hover:text-ui-fg-base"
      >
        Shopify
      </a>
    </Text>
  )
}

export default MedusaCTA
