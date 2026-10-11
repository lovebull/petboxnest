import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261011075425 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_bundle_offer_component" add column if not exists "original_required_quantity" integer null, add column if not exists "link_created_by_offer" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "pbn_bundle_offer_component" drop column if exists "original_required_quantity", drop column if exists "link_created_by_offer";`);
  }

}
