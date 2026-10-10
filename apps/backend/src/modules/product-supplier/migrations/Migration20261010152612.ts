import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261010152612 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_product_supplier_source" drop constraint if exists "pbn_product_supplier_source_product_id_unique";`);
    this.addSql(`create table if not exists "pbn_product_supplier_source" ("id" text not null, "product_id" text not null, "supplier_1688_url" text null, "supplier_taobao_url" text null, "supplier_jd_url" text null, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pbn_product_supplier_source_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_product_supplier_source_product_id_unique" ON "pbn_product_supplier_source" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_product_supplier_source_deleted_at" ON "pbn_product_supplier_source" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pbn_product_supplier_source_updated_at" ON "pbn_product_supplier_source" ("updated_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "pbn_product_supplier_source" cascade;`);
  }

}
