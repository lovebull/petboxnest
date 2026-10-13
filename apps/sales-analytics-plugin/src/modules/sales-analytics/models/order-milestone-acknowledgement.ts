import { model } from "@medusajs/framework/utils";

const OrderMilestoneAcknowledgement = model
  .define(
    {
      tableName: "pbn_order_milestone_acknowledgement",
      name: "OrderMilestoneAcknowledgement",
    },
    {
      id: model.id({ prefix: "omack" }).primaryKey(),
      milestone_id: model.text(),
      admin_user_id: model.text(),
      dismissed_at: model.dateTime(),
    },
  )
  .indexes([
    {
      name: "UQ_pbn_order_milestone_ack_admin",
      on: ["milestone_id", "admin_user_id"],
      unique: true,
    },
    {
      name: "IDX_pbn_order_milestone_ack_admin_time",
      on: ["admin_user_id", "dismissed_at"],
    },
  ]);

export default OrderMilestoneAcknowledgement;
