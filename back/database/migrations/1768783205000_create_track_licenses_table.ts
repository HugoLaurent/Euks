import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'track_licenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('track_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tracks')
        .onDelete('CASCADE')
      table
        .integer('license_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('licenses')
        .onDelete('CASCADE')
      table.integer('price_cents').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['track_id', 'license_id'])
      table.index(['track_id'])
      table.index(['license_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
