import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260913095423 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "pbn_checkout_error" drop constraint if exists "pbn_checkout_error_resource_check";`,
    );

    this.addSql(
      `alter table if exists "pbn_checkout_error" add column if not exists "route_key" text null, add column if not exists "digest" text null;`,
    );
    this.addSql(
      `alter table if exists "pbn_checkout_error" add constraint "pbn_checkout_error_resource_check" check("resource" in ('cart', 'shipping_options', 'payment_providers', 'store_credit', 'route_render'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table if exists "pbn_checkout_error" drop constraint if exists "pbn_checkout_error_resource_check";`,
    );

    this.addSql(
      `alter table if exists "pbn_checkout_error" drop column if exists "route_key", drop column if exists "digest";`,
    );

    this.addSql(
      `alter table if exists "pbn_checkout_error" add constraint "pbn_checkout_error_resource_check" check("resource" in ('cart', 'shipping_options', 'payment_providers', 'store_credit'));`,
    );
  }
}
