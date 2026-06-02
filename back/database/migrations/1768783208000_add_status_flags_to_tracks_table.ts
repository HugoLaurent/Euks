import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tracks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_active').notNullable().defaultTo(true)
      table.boolean('is_sold').notNullable().defaultTo(false)
      table.timestamp('sold_at').nullable()

      table.index(['is_active'])
      table.index(['is_sold'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['is_active'])
      table.dropIndex(['is_sold'])
      table.dropColumn('sold_at')
      table.dropColumn('is_sold')
      table.dropColumn('is_active')
    })
  }
}
