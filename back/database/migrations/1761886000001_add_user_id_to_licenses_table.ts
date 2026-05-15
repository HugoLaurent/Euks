import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // user_id - qui a créé cette license
      // null pour les templates Admin
      table.integer('user_id').nullable().unsigned()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      // Unique constraint: un artiste ne peut pas avoir 2 licenses avec la même clé
      table.unique(['user_id', 'key'], { indexName: 'licenses_user_id_key_unique' })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('licenses_user_id_foreign')
      table.dropUnique(['user_id', 'key'], 'licenses_user_id_key_unique')
      table.dropColumn('user_id')
    })
  }
}
