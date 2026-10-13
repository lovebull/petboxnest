import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Trophy } from "@medusajs/icons";
import { Badge, Button, Text } from "@medusajs/ui";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { sdk } from "../lib/sdk";
import type { OrderMilestonesResponse } from "../types";

const OrderMilestoneTopbar = () => {
  const milestones = useQuery({
    queryKey: ["order-milestones"],
    queryFn: () =>
      sdk.client.fetch<OrderMilestonesResponse>("/admin/order-milestones"),
    refetchInterval: 60_000,
  });
  const unread = milestones.data?.order_milestones.unread_count || 0;

  if (!unread) return null;

  return (
    <Button asChild size="small" variant="transparent">
      <Link to="/order-milestones" aria-label={`${unread} 个未读订单里程碑`}>
        <Trophy />
        <Text size="small" weight="plus">
          订单成就
        </Text>
        <Badge color="orange">{unread}</Badge>
      </Link>
    </Button>
  );
};

export const config = defineWidgetConfig({
  zone: "topbar",
  id: "petboxnest-order-milestone-topbar",
});

export default OrderMilestoneTopbar;
