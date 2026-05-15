import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tracks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('title', 255).notNullable()
      table.text('cover_image_path').nullable()
      table.text('audio_file_path').nullable()
      table.integer('duration_seconds').nullable()
      table.integer('bpm').nullable()
      table
        .integer('musical_key_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('musical_keys')
        .onDelete('SET NULL')
      table.integer('price_cents').notNullable().defaultTo(0)
      table.integer('listen_count').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['title'])
      table.index(['musical_key_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
