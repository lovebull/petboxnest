import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261011075057 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_bundle_offer" drop constraint if exists "pbn_bundle_offer_product_id_unique";`);
    this.addSql(`create table if not exists "pbn_bundle_offer" ("id" text not null, "product_id" text not null, "title" text not null, "subtitle" text null, "status" text check ("status" in ('draft', 'active', 'archived')) not null default 'draft', "starts_at" timestamptz null, "ends_at" timestamptz null, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_bundle_offer_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_bundle_offer_product_id_unique" ON "pbn_bundle_offer" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_offer_deleted_at" ON "pbn_bundle_offer" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_offer_status" ON "pbn_bundle_offer" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_offer_schedule" ON "pbn_bundle_offer" ("starts_at", "ends_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_bundle_offer_component" ("id" text not null, "option_id" text not null, "inventory_item_id" text not null, "required_quantity" integer not null, "role" text check ("role" in ('paid', 'gift')) not null default 'paid', "label" text null, "display_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_bundle_offer_component_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_offer_component_deleted_at" ON "pbn_bundle_offer_component" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_component_option" ON "pbn_bundle_offer_component" ("option_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_component_inventory" ON "pbn_bundle_offer_component" ("inventory_item_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_pbn_bundle_component_option_inventory" ON "pbn_bundle_offer_component" ("option_id", "inventory_item_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_bundle_offer_option" ("id" text not null, "offer_id" text not null, "variant_id" text not null, "title" text not null, "subtitle" text null, "badge" text null, "gift_label" text null, "compare_at_prices" jsonb null, "display_order" integer not null default 0, "is_default" boolean not null default false, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_bundle_offer_option_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_offer_option_deleted_at" ON "pbn_bundle_offer_option" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_option_offer_order" ON "pbn_bundle_offer_option" ("offer_id", "display_order") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_bundle_option_variant" ON "pbn_bundle_offer_option" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "UQ_pbn_bundle_option_offer_variant" ON "pbn_bundle_offer_option" ("offer_id", "variant_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_bundle_offer" cascade;`);

    this.addSql(`drop table if exists "pbn_bundle_offer_component" cascade;`);

    this.addSql(`drop table if exists "pbn_bundle_offer_option" cascade;`);
  }

}
