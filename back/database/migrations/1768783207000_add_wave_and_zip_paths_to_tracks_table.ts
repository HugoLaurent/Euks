import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tracks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('wave_file_path').nullable()
      table.text('zip_file_path').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('wave_file_path')
      table.dropColumn('zip_file_path')
    })
  }
}
