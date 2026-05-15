import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    const hasIsTemplate = await this.schema.hasColumn(this.tableName, 'is_template')

    if (hasIsTemplate) {
      return
    }

    this.schema.alterTable(this.tableName, (table) => {
      table.json('audio_formats').nullable()
      table.string('track_separation', 50).nullable()

      table.bigInteger('max_streams').nullable()
      table.bigInteger('max_downloads').nullable()
      table.bigInteger('max_sales').nullable()

      table.boolean('allow_video_clips').notNullable().defaultTo(false)
      table.integer('video_clips_limit').nullable()
      table.json('allowed_platforms').nullable()

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

      table.boolean('is_exclusive').notNullable().defaultTo(false)
      table.boolean('allow_commercial_use').notNullable().defaultTo(false)
      table.string('commercial_use_limit', 100).nullable()
      table.text('commercial_use_description').nullable()

      table.json('allowed_territories').nullable()
      table.integer('duration_months').nullable()
      table.dateTime('license_start_date').nullable()
      table.dateTime('license_end_date').nullable()

      table.boolean('allow_transfer').notNullable().defaultTo(false)
      table.boolean('allow_sublicense').notNullable().defaultTo(false)
      table.text('transfer_restrictions').nullable()

      table.boolean('require_master_credit').notNullable().defaultTo(true)
      table.boolean('require_publishing_credit').notNullable().defaultTo(true)
      table.boolean('require_artist_credit').notNullable().defaultTo(true)
      table.text('credit_requirements').nullable()

      table.decimal('master_split_percentage', 5, 2).notNullable().defaultTo(0)
      table.decimal('publishing_split_percentage', 5, 2).notNullable().defaultTo(0)
      table.decimal('third_party_split_percentage', 5, 2).notNullable().defaultTo(0)

      table.string('min_audio_bitrate', 50).nullable()
      table.boolean('require_drm_encryption').notNullable().defaultTo(false)
      table.boolean('allow_offline_listening').notNullable().defaultTo(false)
      table.integer('max_concurrent_streams').nullable()

      table.boolean('allow_track_modification').notNullable().defaultTo(false)
      table.boolean('require_approval_for_modification').notNullable().defaultTo(false)
      table.text('modification_restrictions').nullable()

      table.boolean('allow_nonprofit_use').notNullable().defaultTo(false)
      table.boolean('allow_educational_use').notNullable().defaultTo(false)
      table.boolean('allow_religious_use').notNullable().defaultTo(false)
      table.boolean('allow_political_use').notNullable().defaultTo(false)
      table.boolean('allow_adult_content').notNullable().defaultTo(true)
      table.boolean('allow_gambling_use').notNullable().defaultTo(false)
      table.boolean('allow_military_use').notNullable().defaultTo(false)

      table.text('restricted_genres').nullable()
      table.text('restricted_use_cases').nullable()
      table.text('additional_terms').nullable()
      table.boolean('requires_written_agreement').notNullable().defaultTo(false)

      table.dateTime('revision_date').nullable()
      table.text('revision_notes').nullable()
      table.boolean('is_template').notNullable().defaultTo(false)
      table.string('template_category', 100).nullable()

      table.index(['is_exclusive'])
      table.index(['is_template'])
      table.index(['template_category'])
    })
  }

  async down() {
    const hasIsTemplate = await this.schema.hasColumn(this.tableName, 'is_template')

    if (!hasIsTemplate) {
      return
    }

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'audio_formats',
        'track_separation',
        'max_streams',
        'max_downloads',
        'max_sales',
        'allow_video_clips',
        'video_clips_limit',
        'allowed_platforms',
        'allow_live_performance',
        'allow_radio_airplay',
        'allow_television',
        'allow_streaming',
        'allow_podcast',
        'allow_mechanical_repro',
        'allow_remix',
        'allow_remix_distribution',
        'allow_sampling',
        'allow_monetization',
        'allow_content_id',
        'is_exclusive',
        'allow_commercial_use',
        'commercial_use_limit',
        'commercial_use_description',
        'allowed_territories',
        'duration_months',
        'license_start_date',
        'license_end_date',
        'allow_transfer',
        'allow_sublicense',
        'transfer_restrictions',
        'require_master_credit',
        'require_publishing_credit',
        'require_artist_credit',
        'credit_requirements',
        'master_split_percentage',
        'publishing_split_percentage',
        'third_party_split_percentage',
        'min_audio_bitrate',
        'require_drm_encryption',
        'allow_offline_listening',
        'max_concurrent_streams',
        'allow_track_modification',
        'require_approval_for_modification',
        'modification_restrictions',
        'allow_nonprofit_use',
        'allow_educational_use',
        'allow_religious_use',
        'allow_political_use',
        'allow_adult_content',
        'allow_gambling_use',
        'allow_military_use',
        'restricted_genres',
        'restricted_use_cases',
        'additional_terms',
        'requires_written_agreement',
        'revision_date',
        'revision_notes',
        'is_template',
        'template_category'
      )
    })
  }
}
