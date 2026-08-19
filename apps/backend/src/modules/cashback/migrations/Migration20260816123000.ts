import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260816123000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `create table if not exists "cashback_rule" (
        "id" text not null,
        "key" text not null,
        "name" text not null,
        "is_active" boolean not null default false,
        "reward_type" text check ("reward_type" in ('percentage', 'fixed')) not null,
        "reward_value" numeric not null,
        "currency_code" text not null,
        "minimum_order_amount" numeric not null default 0,
        "maximum_cashback_amount" numeric null,
        "waiting_days" integer not null default 30,
        "starts_at" timestamptz null,
        "ends_at" timestamptz null,
        "metadata" jsonb null,
        "raw_reward_value" jsonb not null,
        "raw_minimum_order_amount" jsonb not null,
        "raw_maximum_cashback_amount" jsonb null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "cashback_rule_pkey" primary key ("id")
      );`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cashback_rule_key_unique" ON "cashback_rule" ("key") WHERE "deleted_at" IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_cashback_rule_deleted_at" ON "cashback_rule" ("deleted_at") WHERE "deleted_at" IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_cashback_rule_active_currency" ON "cashback_rule" ("is_active", "currency_code") WHERE "deleted_at" IS NULL;`
    )

    this.addSql(
      `create table if not exists "cashback_entry" (
        "id" text not null,
        "order_id" text not null,
        "order_display_id" text not null,
        "customer_id" text not null,
        "rule_id" text not null,
        "currency_code" text not null,
        "eligible_amount" numeric not null,
        "pending_amount" numeric not null,
        "credited_amount" numeric not null default 0,
        "reversed_amount" numeric not null default 0,
        "reversal_due" numeric not null default 0,
        "status" text check ("status" in ('pending', 'available', 'partially_reversed', 'reversed', 'cancelled')) not null default 'pending',
        "available_at" timestamptz not null,
        "released_at" timestamptz null,
        "store_credit_account_id" text null,
        "store_credit_transaction_id" text null,
        "reversal_transaction_id" text null,
        "rule_snapshot" jsonb not null,
        "metadata" jsonb null,
        "raw_eligible_amount" jsonb not null,
        "raw_pending_amount" jsonb not null,
        "raw_credited_amount" jsonb not null,
        "raw_reversed_amount" jsonb not null,
        "raw_reversal_due" jsonb not null,
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "cashback_entry_pkey" primary key ("id")
      );`
    )
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cashback_entry_order_id_unique" ON "cashback_entry" ("order_id") WHERE "deleted_at" IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_cashback_entry_deleted_at" ON "cashback_entry" ("deleted_at") WHERE "deleted_at" IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_cashback_entry_customer_currency" ON "cashback_entry" ("customer_id", "currency_code") WHERE "deleted_at" IS NULL;`
    )
    this.addSql(
      `CREATE INDEX IF NOT EXISTS "IDX_cashback_entry_status_available" ON "cashback_entry" ("status", "available_at") WHERE "deleted_at" IS NULL;`
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "cashback_entry" cascade;')
    this.addSql('drop table if exists "cashback_rule" cascade;')
  }
}
