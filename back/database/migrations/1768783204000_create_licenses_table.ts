import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('title', 160).notNullable()
      table.text('description').nullable()
      table.boolean('is_paypal_enabled').notNullable().defaultTo(true)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('sort_order').notNullable().defaultTo(0)
      table.integer('price_cents').notNullable().defaultTo(0)
      table.json('audio_formats').nullable()
      table.string('track_separation', 50).nullable()
      table.bigInteger('max_streams').nullable()
      table.bigInteger('max_sales').nullable()
      table.integer('radio_stations').nullable()
      table.boolean('allow_video_clips').notNullable().defaultTo(false)
      table.integer('video_clips_limit').nullable()
      table.boolean('allow_live_performance').notNullable().defaultTo(false)
      table.boolean('allow_radio_airplay').notNullable().defaultTo(false)
      table.boolean('allow_television').notNullable().defaultTo(false)
      table.boolean('allow_remix').notNullable().defaultTo(false)
      table.boolean('allow_monetization').notNullable().defaultTo(false)
      table.boolean('allow_content_id').notNullable().defaultTo(false)
      table.text('additional_terms').nullable()
      table.boolean('is_template').notNullable().defaultTo(false)
      table.string('template_category', 100).nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id'])
      table.index(['is_active'])
      table.index(['sort_order'])
      table.index(['is_template'])
      table.index(['template_category'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
