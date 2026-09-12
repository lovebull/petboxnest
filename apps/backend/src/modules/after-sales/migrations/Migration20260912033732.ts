import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912033732 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "pbn_order_invoice" drop constraint if exists "pbn_order_invoice_invoice_number_unique";`,
    );
    this.addSql(
      `alter table if exists "pbn_after_sales_request" drop constraint if exists "pbn_after_sales_request_request_number_unique";`,
    );
    this.addSql(
      `create table if not exists "pbn_after_sales_attachment" ("id" text not null, "request_id" text not null, "url" text not null, "mime_type" text not null, "size" integer not null, "uploaded_by" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_after_sales_attachment_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_attachment_deleted_at" ON "pbn_after_sales_attachment" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_attachment_request" ON "pbn_after_sales_attachment" ("request_id") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pbn_after_sales_item" ("id" text not null, "request_id" text not null, "order_item_id" text not null, "title" text not null, "thumbnail" text null, "quantity" integer not null, "reason_code" text null, "exchange_variant_id" text null, "unit_price" numeric not null, "refund_amount" numeric null, "raw_unit_price" jsonb not null, "raw_refund_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_after_sales_item_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_item_deleted_at" ON "pbn_after_sales_item" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_item_request" ON "pbn_after_sales_item" ("request_id") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_item_order_item" ON "pbn_after_sales_item" ("order_item_id") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pbn_after_sales_request" ("id" text not null, "request_number" text not null, "order_id" text not null, "customer_id" text null, "customer_email" text not null, "type" text check ("type" in ('cancel', 'return', 'exchange', 'damaged_claim', 'lost_claim')) not null, "status" text check ("status" in ('draft', 'pending_review', 'approved', 'rejected', 'awaiting_shipment', 'in_transit', 'received', 'processing_refund', 'refunded', 'replacement_processing', 'completed', 'cancelled')) not null default 'pending_review', "reason_code" text not null, "reason_text" text null, "customer_note" text null, "admin_note" text null, "resolution" text check ("resolution" in ('replacement', 'partial_refund', 'full_refund', 'store_credit', 'no_action')) null, "refund_amount" numeric null, "currency_code" text not null, "medusa_return_id" text null, "medusa_exchange_id" text null, "medusa_claim_id" text null, "moderated_by" text null, "submitted_at" timestamptz not null, "approved_at" timestamptz null, "completed_at" timestamptz null, "raw_refund_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_after_sales_request_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_after_sales_request_request_number_unique" ON "pbn_after_sales_request" ("request_number") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_request_deleted_at" ON "pbn_after_sales_request" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_order" ON "pbn_after_sales_request" ("order_id", "created_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_customer" ON "pbn_after_sales_request" ("customer_id", "created_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_email" ON "pbn_after_sales_request" ("customer_email", "created_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_status" ON "pbn_after_sales_request" ("status", "created_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_type" ON "pbn_after_sales_request" ("type", "created_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pbn_after_sales_status_history" ("id" text not null, "request_id" text not null, "from_status" text null, "to_status" text not null, "actor_type" text check ("actor_type" in ('customer', 'guest', 'admin', 'system')) not null, "actor_id" text null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_after_sales_status_history_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_status_history_deleted_at" ON "pbn_after_sales_status_history" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_history_request" ON "pbn_after_sales_status_history" ("request_id", "created_at") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pbn_after_sales_guest_code" ("id" text not null, "order_id" text not null, "email" text not null, "code_hash" text not null, "access_token_hash" text null, "expires_at" timestamptz not null, "verified_at" timestamptz null, "attempts" integer not null default 0, "consumed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_after_sales_guest_code_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_guest_code_deleted_at" ON "pbn_after_sales_guest_code" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_code_order_email" ON "pbn_after_sales_guest_code" ("order_id", "email", "created_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_after_sales_access_token" ON "pbn_after_sales_guest_code" ("access_token_hash") WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `create table if not exists "pbn_order_invoice" ("id" text not null, "invoice_number" text not null, "order_id" text not null, "customer_id" text null, "version" integer not null default 1, "status" text check ("status" in ('issued', 'stale', 'void')) not null default 'issued', "snapshot" jsonb not null, "issued_at" timestamptz not null, "voided_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_order_invoice_pkey" primary key ("id"));`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_order_invoice_invoice_number_unique" ON "pbn_order_invoice" ("invoice_number") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_order_invoice_deleted_at" ON "pbn_order_invoice" ("deleted_at") WHERE deleted_at IS NULL;`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_pbn_invoice_order" ON "pbn_order_invoice" ("order_id", "version") WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_after_sales_attachment" cascade;`);

    this.addSql(`drop table if exists "pbn_after_sales_item" cascade;`);

    this.addSql(`drop table if exists "pbn_after_sales_request" cascade;`);

    this.addSql(
      `drop table if exists "pbn_after_sales_status_history" cascade;`,
    );

    this.addSql(`drop table if exists "pbn_after_sales_guest_code" cascade;`);

    this.addSql(`drop table if exists "pbn_order_invoice" cascade;`);
  }
}
