import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'track_tags'

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
        .integer('tag_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['track_id', 'tag_id'])
      table.index(['track_id'])
      table.index(['tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
