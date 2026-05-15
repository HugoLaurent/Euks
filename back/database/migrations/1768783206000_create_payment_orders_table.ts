import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payment_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('provider', 40).notNullable().defaultTo('paypal')
      table
        .integer('track_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('tracks')
        .onDelete('SET NULL')
      table
        .integer('license_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('licenses')
        .onDelete('SET NULL')
      table.string('track_title_snapshot', 255).notNullable()
      table.string('license_key_snapshot', 80).notNullable()
      table.string('license_title_snapshot', 160).notNullable()
      table.integer('amount_cents').notNullable()
      table.string('currency_code', 3).notNullable()
      table.string('status', 40).notNullable()
      table.string('paypal_order_id', 80).nullable().unique()
      table.string('paypal_capture_id', 80).nullable().unique()
      table.string('payer_email', 255).nullable()
      table.text('request_payload').nullable()
      table.text('order_payload').nullable()
      table.text('capture_payload').nullable()
      table.text('error_payload').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['provider'])
      table.index(['status'])
      table.index(['track_id'])
      table.index(['license_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
