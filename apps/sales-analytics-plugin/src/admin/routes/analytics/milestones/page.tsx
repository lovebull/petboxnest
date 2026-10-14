import { defineRouteConfig } from "@medusajs/admin-sdk";
import { OrderMilestonesPage } from "../../order-milestones/page";

export const config = defineRouteConfig({
  label: "订单里程碑 / Goals",
  rank: 3,
});

export default OrderMilestonesPage;
