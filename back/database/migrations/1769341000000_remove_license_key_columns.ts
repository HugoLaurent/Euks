import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.schema.raw(`
      ALTER TABLE "licenses"
      DROP CONSTRAINT IF EXISTS "licenses_user_id_key_unique"
    `)

    await this.schema.raw(`
      ALTER TABLE "licenses"
      DROP CONSTRAINT IF EXISTS "licenses_key_unique"
    `)

    await this.schema.raw(`
      ALTER TABLE "payment_orders"
      ADD COLUMN IF NOT EXISTS "license_id_snapshot" integer
    `)

    await this.schema.raw(`
      UPDATE "payment_orders"
      SET "license_id_snapshot" = COALESCE("license_id_snapshot", "license_id")
      WHERE "license_id" IS NOT NULL
    `)

    await this.schema.raw(`
      ALTER TABLE "payment_orders"
      DROP COLUMN IF EXISTS "license_key_snapshot"
    `)

    await this.schema.raw(`
      ALTER TABLE "licenses"
      DROP COLUMN IF EXISTS "key"
    `)
  }

  async down() {
    await this.schema.raw(`
      ALTER TABLE "licenses"
      ADD COLUMN IF NOT EXISTS "key" varchar(80)
    `)

    await this.schema.raw(`
      UPDATE "licenses"
      SET "key" = COALESCE("key", 'license_' || "id"::text)
      WHERE "key" IS NULL
    `)

    await this.schema.raw(`
      ALTER TABLE "licenses"
      ALTER COLUMN "key" SET NOT NULL
    `)

    await this.schema.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'licenses_key_unique'
        ) THEN
          ALTER TABLE "licenses"
          ADD CONSTRAINT "licenses_key_unique" UNIQUE ("key");
        END IF;
      END
      $$;
    `)

    await this.schema.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'licenses_user_id_key_unique'
        ) THEN
          ALTER TABLE "licenses"
          ADD CONSTRAINT "licenses_user_id_key_unique" UNIQUE ("user_id", "key");
        END IF;
      END
      $$;
    `)

    await this.schema.raw(`
      ALTER TABLE "payment_orders"
      ADD COLUMN IF NOT EXISTS "license_key_snapshot" varchar(80)
    `)

    await this.schema.raw(`
      UPDATE "payment_orders"
      SET "license_key_snapshot" = COALESCE("license_key_snapshot", 'license_' || "license_id_snapshot"::text)
      WHERE "license_id_snapshot" IS NOT NULL
    `)

    await this.schema.raw(`
      ALTER TABLE "payment_orders"
      ALTER COLUMN "license_key_snapshot" SET NOT NULL
    `)

    await this.schema.raw(`
      ALTER TABLE "payment_orders"
      DROP COLUMN IF EXISTS "license_id_snapshot"
    `)
  }
}
