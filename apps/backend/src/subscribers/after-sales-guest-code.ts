import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";

export default async function afterSalesGuestCodeHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return;
  const notification = container.resolve(Modules.NOTIFICATION);
  await notification.createNotifications({
    to: data.record.email,
    channel: "email",
    template: "after-sales-code",
    data: { code: data.code, order: data.order },
  });
}

export const config: SubscriberConfig = {
  event: "after_sales.guest_code_requested",
};
