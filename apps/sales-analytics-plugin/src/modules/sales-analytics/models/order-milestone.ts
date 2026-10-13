import { model } from "@medusajs/framework/utils";

const OrderMilestone = model
  .define(
    {
      tableName: "pbn_order_milestone",
      name: "OrderMilestone",
    },
    {
      id: model.id({ prefix: "omil" }).primaryKey(),
      threshold: model.number().unique(),
      achieved_order_count: model.number(),
      achieved_at: model.dateTime(),
    },
  )
  .indexes([
    {
      name: "IDX_pbn_order_milestone_achieved_at",
      on: ["achieved_at"],
    },
  ]);

export default OrderMilestone;
