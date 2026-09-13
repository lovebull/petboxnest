import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import CommerceAutomationList from "../../components/commerce-automation-list"

const RestockNotificationsPage = () => <CommerceAutomationList feature="restock" />
export const config = defineRouteConfig({ label: "缺货通知 / Restock", icon: ChatBubbleLeftRight })
export default RestockNotificationsPage
