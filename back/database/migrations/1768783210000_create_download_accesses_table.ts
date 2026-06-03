import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'download_accesses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      
      // Lien à l'utilisateur
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      
      // Lien à la commande de paiement
      table
        .integer('payment_order_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('payment_orders')
        .onDelete('CASCADE')
      
      // Lien au track
      table
        .integer('track_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tracks')
        .onDelete('CASCADE')
      
      // Lien à la licence
      table
        .integer('license_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('licenses')
        .onDelete('CASCADE')
      
      // Type de fichier téléchargé (audio, stems, cover, etc.)
      table.enum('file_type', ['audio', 'stems', 'cover', 'wave']).notNullable().defaultTo('audio')
      
      // Compteur de téléchargements
      table.integer('download_count').notNullable().defaultTo(0)
      
      // Expiration optionnelle
      table.timestamp('expires_at').nullable()
      
      // Tokens d'accès uniques
      table.string('access_token', 255).nullable().unique()
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      
      table.index(['user_id'])
      table.index(['payment_order_id'])
      table.index(['track_id'])
      table.index(['access_token'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
