import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import CommerceAutomationList from "../../components/commerce-automation-list"

const CartRecoveriesPage = () => <CommerceAutomationList feature="cart-recovery" />
export const config = defineRouteConfig({ label: "弃购恢复 / Cart Recovery", icon: ChatBubbleLeftRight })
export default CartRecoveriesPage
