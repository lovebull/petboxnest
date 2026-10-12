import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261012052903 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_procurement_receipt" drop constraint if exists "pbn_procurement_receipt_receipt_number_unique";`);
    this.addSql(`alter table if exists "pbn_procurement_order" drop constraint if exists "pbn_procurement_order_order_number_unique";`);
    this.addSql(`alter table if exists "pbn_procurement_supplier" drop constraint if exists "pbn_procurement_supplier_code_unique";`);
    this.addSql(`create table if not exists "pbn_procurement_audit" ("id" text not null, "entity_type" text not null, "entity_id" text not null, "action" text not null, "admin_user_id" text null, "previous_values" jsonb null, "new_values" jsonb null, "created_at_event" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_procurement_audit_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_audit_deleted_at" ON "pbn_procurement_audit" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_audit_entity" ON "pbn_procurement_audit" ("entity_type", "entity_id", "created_at_event") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_audit_admin" ON "pbn_procurement_audit" ("admin_user_id", "created_at_event") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_procurement_supplier" ("id" text not null, "code" text not null, "name" text not null, "status" text check ("status" in ('active', 'inactive')) not null default 'active', "contact_name" text null, "email" text null, "phone" text null, "website_url" text null, "supplier_1688_url" text null, "supplier_taobao_url" text null, "supplier_jd_url" text null, "default_currency_code" text not null default 'usd', "payment_terms" text null, "notes" text null, "created_by" text null, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_procurement_supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_procurement_supplier_code_unique" ON "pbn_procurement_supplier" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_supplier_deleted_at" ON "pbn_procurement_supplier" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_supplier_name" ON "pbn_procurement_supplier" ("name") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_supplier_status" ON "pbn_procurement_supplier" ("status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_procurement_order" ("id" text not null, "order_number" text not null, "supplier_id" text not null, "supplier_name" text not null, "status" text check ("status" in ('draft', 'ordered', 'partially_received', 'received', 'cancelled')) not null default 'draft', "payment_status" text check ("payment_status" in ('unpaid', 'partially_paid', 'paid', 'refunded')) not null default 'unpaid', "currency_code" text not null default 'usd', "base_currency_code" text not null default 'usd', "exchange_rate" numeric not null default 1, "subtotal" numeric not null default 0, "shipping_amount" numeric not null default 0, "tax_amount" numeric not null default 0, "discount_amount" numeric not null default 0, "other_amount" numeric not null default 0, "total_amount" numeric not null default 0, "base_total_amount" numeric not null default 0, "paid_amount" numeric not null default 0, "outstanding_amount" numeric not null default 0, "ordered_at" timestamptz null, "expected_at" timestamptz null, "received_at" timestamptz null, "notes" text null, "created_by" text null, "updated_by" text null, "raw_exchange_rate" jsonb not null default '{"value":"1","precision":20}', "raw_subtotal" jsonb not null default '{"value":"0","precision":20}', "raw_shipping_amount" jsonb not null default '{"value":"0","precision":20}', "raw_tax_amount" jsonb not null default '{"value":"0","precision":20}', "raw_discount_amount" jsonb not null default '{"value":"0","precision":20}', "raw_other_amount" jsonb not null default '{"value":"0","precision":20}', "raw_total_amount" jsonb not null default '{"value":"0","precision":20}', "raw_base_total_amount" jsonb not null default '{"value":"0","precision":20}', "raw_paid_amount" jsonb not null default '{"value":"0","precision":20}', "raw_outstanding_amount" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_procurement_order_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_procurement_order_order_number_unique" ON "pbn_procurement_order" ("order_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_order_deleted_at" ON "pbn_procurement_order" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_order_supplier" ON "pbn_procurement_order" ("supplier_id", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_order_status" ON "pbn_procurement_order" ("status", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_order_payment" ON "pbn_procurement_order" ("payment_status", "created_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_order_expected" ON "pbn_procurement_order" ("expected_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_procurement_item" ("id" text not null, "order_id" text not null, "product_id" text null, "variant_id" text null, "sku" text null, "product_title" text not null, "variant_title" text null, "supplier_sku" text null, "supplier_url" text null, "quantity" integer not null, "received_quantity" integer not null default 0, "unit_cost" numeric not null, "line_total" numeric not null, "notes" text null, "raw_unit_cost" jsonb not null, "raw_line_total" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_procurement_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_item_deleted_at" ON "pbn_procurement_item" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_item_order" ON "pbn_procurement_item" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_item_product" ON "pbn_procurement_item" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_item_variant" ON "pbn_procurement_item" ("variant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_item_sku" ON "pbn_procurement_item" ("sku") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_procurement_payment" ("id" text not null, "order_id" text not null, "amount" numeric not null, "currency_code" text not null, "payment_method" text null, "transaction_reference" text null, "paid_at" timestamptz not null, "notes" text null, "created_by" text null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_procurement_payment_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_payment_deleted_at" ON "pbn_procurement_payment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_payment_order" ON "pbn_procurement_payment" ("order_id", "paid_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_procurement_receipt" ("id" text not null, "order_id" text not null, "receipt_number" text not null, "warehouse_name" text null, "received_at" timestamptz not null, "notes" text null, "created_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_procurement_receipt_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_procurement_receipt_receipt_number_unique" ON "pbn_procurement_receipt" ("receipt_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_receipt_deleted_at" ON "pbn_procurement_receipt" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_receipt_order" ON "pbn_procurement_receipt" ("order_id", "received_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "pbn_procurement_receipt_item" ("id" text not null, "receipt_id" text not null, "order_item_id" text not null, "quantity" integer not null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_procurement_receipt_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_receipt_item_deleted_at" ON "pbn_procurement_receipt_item" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_receipt_item_receipt" ON "pbn_procurement_receipt_item" ("receipt_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_procurement_receipt_item_order_item" ON "pbn_procurement_receipt_item" ("order_item_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_procurement_audit" cascade;`);

    this.addSql(`drop table if exists "pbn_procurement_supplier" cascade;`);

    this.addSql(`drop table if exists "pbn_procurement_order" cascade;`);

    this.addSql(`drop table if exists "pbn_procurement_item" cascade;`);

    this.addSql(`drop table if exists "pbn_procurement_payment" cascade;`);

    this.addSql(`drop table if exists "pbn_procurement_receipt" cascade;`);

    this.addSql(`drop table if exists "pbn_procurement_receipt_item" cascade;`);
  }

}
