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

      // === BASICS ===
      table.boolean('is_paypal_enabled').notNullable().defaultTo(true)
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('sort_order').notNullable().defaultTo(0)
      table.integer('price_cents').notNullable().defaultTo(0)

      // === AUDIO FORMATS ===
      table.json('audio_formats').nullable()
      table.string('track_separation', 50).nullable()

      // === DISTRIBUTION LIMITS ===
      table.bigInteger('max_streams').nullable()
      table.bigInteger('max_downloads').nullable()
      table.bigInteger('max_sales').nullable()
      table.integer('radio_stations').nullable() // null = illimité

      // === VIDEO CONTENT ===
      table.boolean('allow_video_clips').notNullable().defaultTo(false)
      table.integer('video_clips_limit').nullable()
      table.json('allowed_platforms').nullable()

      // === USAGE RIGHTS ===
      table.boolean('allow_live_performance').notNullable().defaultTo(false)
      table.boolean('allow_radio_airplay').notNullable().defaultTo(false)
      table.boolean('allow_television').notNullable().defaultTo(false)
      table.boolean('allow_streaming').notNullable().defaultTo(true)
      table.boolean('allow_podcast').notNullable().defaultTo(false)
      table.boolean('allow_mechanical_repro').notNullable().defaultTo(false)
      table.boolean('allow_remix').notNullable().defaultTo(false)
      table.boolean('allow_remix_distribution').notNullable().defaultTo(false)
      table.boolean('allow_sampling').notNullable().defaultTo(false)
      table.boolean('allow_monetization').notNullable().defaultTo(false)
      table.boolean('allow_content_id').notNullable().defaultTo(false)

      // === COMMERCIALITY ===
      table.boolean('is_exclusive').notNullable().defaultTo(false)
      table.boolean('allow_commercial_use').notNullable().defaultTo(false)
      table.string('commercial_use_limit', 100).nullable()
      table.text('commercial_use_description').nullable()

      // === TERRITORIAL & DURATION ===
      table.json('allowed_territories').nullable()
      table.integer('duration_months').nullable()
      table.dateTime('license_start_date').nullable()
      table.dateTime('license_end_date').nullable()

      // === TRANSFER & SUBLICENSE ===
      table.boolean('allow_transfer').notNullable().defaultTo(false)
      table.boolean('allow_sublicense').notNullable().defaultTo(false)
      table.text('transfer_restrictions').nullable()

      // === ATTRIBUTION & SPLITS ===
      table.boolean('require_master_credit').notNullable().defaultTo(true)
      table.boolean('require_publishing_credit').notNullable().defaultTo(true)
      table.boolean('require_artist_credit').notNullable().defaultTo(true)
      table.text('credit_requirements').nullable()
      table.decimal('master_split_percentage', 5, 2).notNullable().defaultTo(0)
      table.decimal('publishing_split_percentage', 5, 2).notNullable().defaultTo(0)
      table.decimal('third_party_split_percentage', 5, 2).notNullable().defaultTo(0)

      // === TECHNICAL RESTRICTIONS ===
      table.string('min_audio_bitrate', 50).nullable()
      table.boolean('require_drm_encryption').notNullable().defaultTo(false)
      table.boolean('allow_offline_listening').notNullable().defaultTo(false)
      table.integer('max_concurrent_streams').nullable()

      // === MODIFICATIONS ===
      table.boolean('allow_track_modification').notNullable().defaultTo(false)
      table.boolean('require_approval_for_modification').notNullable().defaultTo(false)
      table.text('modification_restrictions').nullable()

      // === RESTRICTED USES ===
      table.boolean('allow_nonprofit_use').notNullable().defaultTo(false)
      table.boolean('allow_educational_use').notNullable().defaultTo(false)
      table.boolean('allow_religious_use').notNullable().defaultTo(false)
      table.boolean('allow_political_use').notNullable().defaultTo(false)
      table.boolean('allow_adult_content').notNullable().defaultTo(true)
      table.boolean('allow_gambling_use').notNullable().defaultTo(false)
      table.boolean('allow_military_use').notNullable().defaultTo(false)

      // === RESTRICTIONS ===
      table.text('restricted_genres').nullable()
      table.text('restricted_use_cases').nullable()
      table.text('additional_terms').nullable()
      table.boolean('requires_written_agreement').notNullable().defaultTo(false)

      // === VERSIONING ===
      table.dateTime('revision_date').nullable()
      table.text('revision_notes').nullable()
      table.boolean('is_template').notNullable().defaultTo(false)
      table.string('template_category', 100).nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index(['user_id'])
      table.index(['is_active'])
      table.index(['sort_order'])
      table.index(['is_exclusive'])
      table.index(['is_template'])
      table.index(['template_category'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
