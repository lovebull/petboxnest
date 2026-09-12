import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912123641 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_after_sales_request" add column if not exists "customer_message" text null;`);

    this.addSql(`alter table if exists "pbn_after_sales_status_history" add column if not exists "public_note" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "pbn_after_sales_request" drop column if exists "customer_message";`);

    this.addSql(`alter table if exists "pbn_after_sales_status_history" drop column if exists "public_note";`);
  }

}
