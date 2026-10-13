import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChartBar } from "@medusajs/icons";
import { Navigate } from "react-router-dom";

const AnalyticsRoute = () => <Navigate to="/analytics/overview" replace />;

export const config = defineRouteConfig({
  label: "经营分析 / Analytics",
  icon: ChartBar,
  rank: 14,
});

export default AnalyticsRoute;
