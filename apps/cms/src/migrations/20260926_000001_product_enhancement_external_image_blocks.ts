import { MigrateDownArgs, MigrateUpArgs, sql } from "@payloadcms/db-postgres"

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "product_enhancements_image_blocks"
      ADD COLUMN IF NOT EXISTS "image_source" varchar DEFAULT 'upload' NOT NULL,
      ADD COLUMN IF NOT EXISTS "image_url" varchar,
      ADD COLUMN IF NOT EXISTS "image_alt" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "product_enhancements_image_blocks"
      DROP COLUMN IF EXISTS "image_alt",
      DROP COLUMN IF EXISTS "image_url",
      DROP COLUMN IF EXISTS "image_source";
  `)
}
