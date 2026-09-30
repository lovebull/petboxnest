import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260930120725 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "pbn_media_asset" drop constraint if exists "pbn_media_asset_sha256_unique";`);
    this.addSql(`alter table if exists "pbn_media_asset" add column if not exists "sha256" text null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pbn_media_asset_sha256_unique" ON "pbn_media_asset" ("sha256") WHERE sha256 IS NOT NULL AND deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_pbn_media_asset_sha256_unique";`);
    this.addSql(`alter table if exists "pbn_media_asset" drop column if exists "sha256";`);
  }

}
