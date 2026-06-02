import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    const hasUserId = await this.schema.hasColumn(this.tableName, 'user_id')

    if (hasUserId) {
      return
    }

    await this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').nullable().unsigned().references('users.id').onDelete('CASCADE')
      table.index(['user_id'])
    })
  }

  async down() {
    const hasUserId = await this.schema.hasColumn(this.tableName, 'user_id')

    if (!hasUserId) {
      return
    }

    await this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'])
      table.dropIndex(['user_id'])
      table.dropColumn('user_id')
    })
  }
}
