import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Formats audio supportés (JSON array: ['mp3', 'wav', 'flac'])
      table.json('audio_formats').nullable()

      // Séparation des pistes: 'full_mix' | 'stems' | 'instrumental_only' | 'vocal_only'
      table.string('track_separation', 50).nullable()

      // === PLAFONDS DE DISTRIBUTION ===
      table.bigInteger('max_streams').nullable() // null = illimité
      table.bigInteger('max_downloads').nullable()
      table.bigInteger('max_sales').nullable()

      // === CONTENU VIDÉO ===
      table.boolean('allow_video_clips').notNullable().defaultTo(false)
      table.integer('video_clips_limit').nullable() // max clips autorisés
      table.json('allowed_platforms').nullable() // ['tiktok', 'youtube', 'instagram', 'twitch', 'facebook']

      // === USAGE AUTORISÉ ===
      table.boolean('allow_live_performance').notNullable().defaultTo(false)
      table.boolean('allow_radio_airplay').notNullable().defaultTo(false)
      table.boolean('allow_television').notNullable().defaultTo(false)
      table.boolean('allow_streaming').notNullable().defaultTo(true)
      table.boolean('allow_podcast').notNullable().defaultTo(false)
      table.boolean('allow_mechanical_repro').notNullable().defaultTo(false) // Karaoké, covers
      table.boolean('allow_remix').notNullable().defaultTo(false)
      table.boolean('allow_remix_distribution').notNullable().defaultTo(false) // Publier les remixes
      table.boolean('allow_sampling').notNullable().defaultTo(false)
      table.boolean('allow_monetization').notNullable().defaultTo(false)
      table.boolean('allow_content_id').notNullable().defaultTo(false)

      // === COMMERCIALITÉ ===
      table.boolean('is_exclusive').notNullable().defaultTo(false)
      table.boolean('allow_commercial_use').notNullable().defaultTo(false)
      table.string('commercial_use_limit', 100).nullable() // 'unlimited' | 'limited' | 'prohibited'
      table.text('commercial_use_description').nullable() // Description des limites

      // === TERRITORIAL ET DURÉE ===
      table.json('allowed_territories').nullable() // ['US', 'FR', 'DE'] ou ['WORLDWIDE']
      table.integer('duration_months').nullable() // null = perpétuel
      table.datetime('license_start_date').nullable()
      table.datetime('license_end_date').nullable()

      // === DROITS D'EXPLOITATION ===
      table.boolean('allow_transfer').notNullable().defaultTo(false)
      table.boolean('allow_sublicense').notNullable().defaultTo(false)
      table.text('transfer_restrictions').nullable()

      // === ATTRIBUTION ET SPLITS ===
      table.boolean('require_master_credit').notNullable().defaultTo(true)
      table.boolean('require_publishing_credit').notNullable().defaultTo(true)
      table.boolean('require_artist_credit').notNullable().defaultTo(true)
      table.text('credit_requirements').nullable() // Format exact du crédit

      table.decimal('master_split_percentage', 5, 2).notNullable().defaultTo(0) // 0-100%
      table.decimal('publishing_split_percentage', 5, 2).notNullable().defaultTo(0)
      table.decimal('third_party_split_percentage', 5, 2).notNullable().defaultTo(0)

      // === QUALITÉ ET RESTRICTIONS TECHNIQUES ===
      table.string('min_audio_bitrate', 50).nullable() // '128' | '192' | '256' | '320' | 'lossless'
      table.boolean('require_drm_encryption').notNullable().defaultTo(false)
      table.boolean('allow_offline_listening').notNullable().defaultTo(false)
      table.integer('max_concurrent_streams').nullable() // Pour streaming services

      // === MODIFICATIONS ET VERSIONING ===
      table.boolean('allow_track_modification').notNullable().defaultTo(false)
      table.boolean('require_approval_for_modification').notNullable().defaultTo(false)
      table.text('modification_restrictions').nullable()

      // === USAGE RESTREINT ===
      table.boolean('allow_nonprofit_use').notNullable().defaultTo(false)
      table.boolean('allow_educational_use').notNullable().defaultTo(false)
      table.boolean('allow_religious_use').notNullable().defaultTo(false)
      table.boolean('allow_political_use').notNullable().defaultTo(false)
      table.boolean('allow_adult_content').notNullable().defaultTo(true)
      table.boolean('allow_gambling_use').notNullable().defaultTo(false)
      table.boolean('allow_military_use').notNullable().defaultTo(false)

      // === AUTRES RESTRICTIONS ===
      table.text('restricted_genres').nullable() // JSON: genres interdits
      table.text('restricted_use_cases').nullable() // JSON: cas d'usage interdits
      table.text('additional_terms').nullable() // Clause libre
      table.boolean('requires_written_agreement').notNullable().defaultTo(false)

      // === TRACKING ET AUDIT ===
      table.datetime('revision_date').nullable() // Date de dernière révision
      table.text('revision_notes').nullable()
      table.boolean('is_template').notNullable().defaultTo(false) // Est-ce un template réutilisable ?
      table.string('template_category', 100).nullable() // 'standard' | 'premium' | 'exclusive' | 'custom'

      table.index(['is_exclusive'])
      table.index(['is_template'])
      table.index(['template_category'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Tous les champs sont supprimés avec la table elle-même
      // ou on peut utiliser dropColumn pour chaque colonne
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
