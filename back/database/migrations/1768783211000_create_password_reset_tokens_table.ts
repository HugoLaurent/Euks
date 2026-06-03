import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      // SHA-256 hash of the token (the raw token is only sent by email).
      table.string('token_hash', 64).notNullable().unique()

      table.timestamp('expires_at').notNullable()
      table.timestamp('created_at').notNullable()

      table.index(['token_hash'])
      table.index(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
