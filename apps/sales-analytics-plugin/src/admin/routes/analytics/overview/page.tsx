import { defineRouteConfig } from "@medusajs/admin-sdk";
import { CommerceAnalyticsPage } from "../../commerce-analytics/page";

export const config = defineRouteConfig({
  label: "经营概览 / Overview",
  rank: 1,
});

export default CommerceAnalyticsPage;
