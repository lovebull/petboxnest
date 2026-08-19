import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260817113948 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "referral_program" drop constraint if exists "referral_program_key_unique";`);
    this.addSql(`alter table if exists "referral_participant" drop constraint if exists "referral_participant_code_unique";`);
    this.addSql(`alter table if exists "referral_participant" drop constraint if exists "referral_participant_customer_id_unique";`);
    this.addSql(`alter table if exists "referral_conversion" drop constraint if exists "referral_conversion_attribution_id_unique";`);
    this.addSql(`alter table if exists "referral_conversion" drop constraint if exists "referral_conversion_order_id_unique";`);
    this.addSql(`alter table if exists "referral_attribution" drop constraint if exists "referral_attribution_cart_id_unique";`);
    this.addSql(`alter table if exists "commission_ledger_entry" drop constraint if exists "commission_ledger_entry_idempotency_key_unique";`);
    this.addSql(`create table if not exists "commission_ledger_entry" ("id" text not null, "conversion_id" text not null, "participant_id" text not null, "customer_id" text not null, "order_id" text not null, "entry_type" text check ("entry_type" in ('accrual', 'payout', 'reversal', 'adjustment')) not null, "status" text check ("status" in ('pending', 'posted', 'void')) not null default 'pending', "amount" numeric not null, "currency_code" text not null, "available_at" timestamptz null, "posted_at" timestamptz null, "store_credit_transaction_id" text null, "idempotency_key" text not null, "note" text null, "metadata" jsonb null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "commission_ledger_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_commission_ledger_entry_idempotency_key_unique" ON "commission_ledger_entry" ("idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_ledger_entry_deleted_at" ON "commission_ledger_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_ledger_customer_status" ON "commission_ledger_entry" ("customer_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_commission_ledger_conversion" ON "commission_ledger_entry" ("conversion_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "referral_attribution" ("id" text not null, "participant_id" text not null, "referrer_customer_id" text not null, "referred_customer_id" text null, "cart_id" text not null, "code" text not null, "status" text check ("status" in ('active', 'converted', 'expired', 'rejected')) not null default 'active', "expires_at" timestamptz not null, "converted_at" timestamptz null, "rejection_reason" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "referral_attribution_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_attribution_cart_id_unique" ON "referral_attribution" ("cart_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_attribution_deleted_at" ON "referral_attribution" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_attribution_participant" ON "referral_attribution" ("participant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_attribution_customer" ON "referral_attribution" ("referred_customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_attribution_status_expiry" ON "referral_attribution" ("status", "expires_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "referral_conversion" ("id" text not null, "order_id" text not null, "order_display_id" text not null, "attribution_id" text not null, "participant_id" text not null, "referrer_customer_id" text not null, "referred_customer_id" text not null, "currency_code" text not null, "eligible_amount" numeric not null, "commission_amount" numeric not null, "credited_amount" numeric not null default 0, "reversed_amount" numeric not null default 0, "reversal_due" numeric not null default 0, "status" text check ("status" in ('pending', 'paid', 'partially_reversed', 'reversed', 'cancelled')) not null default 'pending', "available_at" timestamptz not null, "paid_at" timestamptz null, "store_credit_account_id" text null, "rule_snapshot" jsonb not null, "metadata" jsonb null, "raw_eligible_amount" jsonb not null, "raw_commission_amount" jsonb not null, "raw_credited_amount" jsonb not null default '{"value":"0","precision":20}', "raw_reversed_amount" jsonb not null default '{"value":"0","precision":20}', "raw_reversal_due" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "referral_conversion_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_conversion_order_id_unique" ON "referral_conversion" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_conversion_attribution_id_unique" ON "referral_conversion" ("attribution_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_conversion_deleted_at" ON "referral_conversion" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_conversion_referrer" ON "referral_conversion" ("referrer_customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_conversion_status_available" ON "referral_conversion" ("status", "available_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "referral_participant" ("id" text not null, "customer_id" text not null, "code" text not null, "is_active" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "referral_participant_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_participant_customer_id_unique" ON "referral_participant" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_participant_code_unique" ON "referral_participant" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_participant_deleted_at" ON "referral_participant" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_participant_code_active" ON "referral_participant" ("code", "is_active") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "referral_program" ("id" text not null, "key" text not null, "name" text not null, "is_active" boolean not null default false, "commission_percentage" integer not null default 8, "referee_discount_percentage" integer not null default 10, "promotion_code" text not null default 'REFERRED10', "promotion_id" text null, "currency_code" text not null default 'usd', "minimum_order_amount" numeric not null default 80, "maximum_commission_amount" numeric null, "waiting_days" integer not null default 30, "attribution_days" integer not null default 30, "stack_with_cashback" boolean not null default false, "raw_minimum_order_amount" jsonb not null default '{"value":"80","precision":20}', "raw_maximum_commission_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "referral_program_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_referral_program_key_unique" ON "referral_program" ("key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_referral_program_deleted_at" ON "referral_program" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "commission_ledger_entry" cascade;`);

    this.addSql(`drop table if exists "referral_attribution" cascade;`);

    this.addSql(`drop table if exists "referral_conversion" cascade;`);

    this.addSql(`drop table if exists "referral_participant" cascade;`);

    this.addSql(`drop table if exists "referral_program" cascade;`);
  }

}
