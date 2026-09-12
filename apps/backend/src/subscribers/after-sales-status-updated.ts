import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

export default async function afterSalesStatusHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;
  const notification = container.resolve(Modules.NOTIFICATION);
  await notification.createNotifications({
    to: data.request.customer_email,
    channel: "email",
    template: "after-sales-update",
    data: { request: data.request },
  });
}

export const config: SubscriberConfig = { event: "after_sales.status_updated" };
