import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    await this.db.rawQuery(`
      ALTER TABLE "licenses"
      ADD COLUMN IF NOT EXISTS "price_cents" integer NOT NULL DEFAULT 0
    `)

    await this.db.rawQuery(`
      UPDATE "licenses"
      SET "price_cents" = CASE
        WHEN LOWER("title") LIKE '%basic%' THEN 999
        WHEN LOWER("title") LIKE '%premium plus%' THEN 3499
        WHEN LOWER("title") LIKE '%premium%' THEN 1999
        WHEN LOWER("title") LIKE '%unlimited%' THEN 4999
        ELSE "price_cents"
      END
      WHERE "is_paypal_enabled" = true
        AND "price_cents" = 0
    `)
  }

  async down() {
    await this.db.rawQuery(`
      ALTER TABLE "licenses"
      DROP COLUMN IF EXISTS "price_cents"
    `)
  }
}
