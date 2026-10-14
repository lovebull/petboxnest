import { defineRouteConfig } from "@medusajs/admin-sdk";
import { SalesAnalyticsPage } from "../../sales-analytics/page";

export const config = defineRouteConfig({
  label: "销售分析 / Sales",
  rank: 2,
});

export default SalesAnalyticsPage;
