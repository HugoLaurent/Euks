import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import type { ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Track from '#models/track'
import User from '#models/user'

export type AudioFormat = 'mp3' | 'wav' | 'flac' | 'aac' | 'ogg' | 'aiff'
export type TrackSeparation = 'full_mix' | 'stems' | 'instrumental_only' | 'vocal_only' | 'acapella'
export type Platform = 'tiktok' | 'youtube' | 'instagram' | 'twitch' | 'facebook' | 'snapchat'
export type Territory = string // ISO country code or 'WORLDWIDE'
export type CommercialUseLimit = 'unlimited' | 'limited' | 'prohibited'
export type MinAudioBitrate = '128' | '192' | '256' | '320' | 'lossless'
export type TemplateCategory = 'standard' | 'premium' | 'exclusive' | 'custom'

function prepareJsonArrayValue(value: unknown[] | null | undefined) {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  return JSON.stringify(value)
}

function consumeJsonArrayValue(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return value
}

export default class License extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number | null

  @column()
  declare title: string

  @column()
  declare description: string | null

  // === BASICS ===
  @column({ columnName: 'is_paypal_enabled' })
  declare isPaypalEnabled: boolean

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column({ columnName: 'sort_order' })
  declare sortOrder: number

  @column({ columnName: 'price_cents' })
  declare priceCents: number

  // === AUDIO FORMATS ===
  @column({
    prepare: prepareJsonArrayValue,
    consume: consumeJsonArrayValue,
  })
  declare audioFormats: AudioFormat[] | null

  @column({ columnName: 'track_separation' })
  declare trackSeparation: TrackSeparation | null

  // === DISTRIBUTION LIMITS ===
  @column({ columnName: 'max_streams' })
  declare maxStreams: number | null

  @column({ columnName: 'max_downloads' })
  declare maxDownloads: number | null

  @column({ columnName: 'max_sales' })
  declare maxSales: number | null

  @column({ columnName: 'radio_stations' })
  declare radioStations: number | null

  // === VIDEO CONTENT ===
  @column({ columnName: 'allow_video_clips' })
  declare allowVideoClips: boolean

  @column({ columnName: 'video_clips_limit' })
  declare videoClipsLimit: number | null

  @column({
    columnName: 'allowed_platforms',
    prepare: prepareJsonArrayValue,
    consume: consumeJsonArrayValue,
  })
  declare allowedPlatforms: Platform[] | null

  // === USAGE RIGHTS ===
  @column({ columnName: 'allow_live_performance' })
  declare allowLivePerformance: boolean

  @column({ columnName: 'allow_radio_airplay' })
  declare allowRadioAirplay: boolean

  @column({ columnName: 'allow_television' })
  declare allowTelevision: boolean

  @column({ columnName: 'allow_streaming' })
  declare allowStreaming: boolean

  @column({ columnName: 'allow_podcast' })
  declare allowPodcast: boolean

  @column({ columnName: 'allow_mechanical_repro' })
  declare allowMechanicalRepro: boolean

  @column({ columnName: 'allow_remix' })
  declare allowRemix: boolean

  @column({ columnName: 'allow_remix_distribution' })
  declare allowRemixDistribution: boolean

  @column({ columnName: 'allow_sampling' })
  declare allowSampling: boolean

  @column({ columnName: 'allow_monetization' })
  declare allowMonetization: boolean

  @column({ columnName: 'allow_content_id' })
  declare allowContentId: boolean

  // === COMMERCIALITY ===
  @column({ columnName: 'is_exclusive' })
  declare isExclusive: boolean

  @column({ columnName: 'allow_commercial_use' })
  declare allowCommercialUse: boolean

  @column({ columnName: 'commercial_use_limit' })
  declare commercialUseLimit: CommercialUseLimit | null

  @column({ columnName: 'commercial_use_description' })
  declare commercialUseDescription: string | null

  // === TERRITORIAL & DURATION ===
  @column({
    columnName: 'allowed_territories',
    prepare: prepareJsonArrayValue,
    consume: consumeJsonArrayValue,
  })
  declare allowedTerritories: Territory[] | null

  @column({ columnName: 'duration_months' })
  declare durationMonths: number | null

  @column.dateTime({ columnName: 'license_start_date' })
  declare licenseStartDate: DateTime | null

  @column.dateTime({ columnName: 'license_end_date' })
  declare licenseEndDate: DateTime | null

  // === TRANSFER & SUBLICENSE ===
  @column({ columnName: 'allow_transfer' })
  declare allowTransfer: boolean

  @column({ columnName: 'allow_sublicense' })
  declare allowSublicense: boolean

  @column({ columnName: 'transfer_restrictions' })
  declare transferRestrictions: string | null

  // === ATTRIBUTION & SPLITS ===
  @column({ columnName: 'require_master_credit' })
  declare requireMasterCredit: boolean

  @column({ columnName: 'require_publishing_credit' })
  declare requirePublishingCredit: boolean

  @column({ columnName: 'require_artist_credit' })
  declare requireArtistCredit: boolean

  @column({ columnName: 'credit_requirements' })
  declare creditRequirements: string | null

  @column({ columnName: 'master_split_percentage' })
  declare masterSplitPercentage: number

  @column({ columnName: 'publishing_split_percentage' })
  declare publishingSplitPercentage: number

  @column({ columnName: 'third_party_split_percentage' })
  declare thirdPartySplitPercentage: number

  // === TECHNICAL RESTRICTIONS ===
  @column({ columnName: 'min_audio_bitrate' })
  declare minAudioBitrate: MinAudioBitrate | null

  @column({ columnName: 'require_drm_encryption' })
  declare requireDrmEncryption: boolean

  @column({ columnName: 'allow_offline_listening' })
  declare allowOfflineListening: boolean

  @column({ columnName: 'max_concurrent_streams' })
  declare maxConcurrentStreams: number | null

  // === MODIFICATIONS ===
  @column({ columnName: 'allow_track_modification' })
  declare allowTrackModification: boolean

  @column({ columnName: 'require_approval_for_modification' })
  declare requireApprovalForModification: boolean

  @column({ columnName: 'modification_restrictions' })
  declare modificationRestrictions: string | null

  // === RESTRICTED USES ===
  @column({ columnName: 'allow_nonprofit_use' })
  declare allowNonprofitUse: boolean

  @column({ columnName: 'allow_educational_use' })
  declare allowEducationalUse: boolean

  @column({ columnName: 'allow_religious_use' })
  declare allowReligiousUse: boolean

  @column({ columnName: 'allow_political_use' })
  declare allowPoliticalUse: boolean

  @column({ columnName: 'allow_adult_content' })
  declare allowAdultContent: boolean

  @column({ columnName: 'allow_gambling_use' })
  declare allowGamblingUse: boolean

  @column({ columnName: 'allow_military_use' })
  declare allowMilitaryUse: boolean

  // === RESTRICTIONS ===
  @column({
    columnName: 'restricted_genres',
    prepare: prepareJsonArrayValue,
    consume: consumeJsonArrayValue,
  })
  declare restrictedGenres: string[] | null

  @column({
    columnName: 'restricted_use_cases',
    prepare: prepareJsonArrayValue,
    consume: consumeJsonArrayValue,
  })
  declare restrictedUseCases: string[] | null

  @column({ columnName: 'additional_terms' })
  declare additionalTerms: string | null

  @column({ columnName: 'requires_written_agreement' })
  declare requiresWrittenAgreement: boolean

  // === VERSIONING ===
  @column.dateTime({ columnName: 'revision_date' })
  declare revisionDate: DateTime | null

  @column({ columnName: 'revision_notes' })
  declare revisionNotes: string | null

  @column({ columnName: 'is_template' })
  declare isTemplate: boolean

  @column({ columnName: 'template_category' })
  declare templateCategory: TemplateCategory | null

  // === RELATIONS ===
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Track, {
    pivotTable: 'track_licenses',
    pivotColumns: ['price_cents', 'is_active'],
    pivotTimestamps: true,
  })
  declare tracks: ManyToMany<typeof Track>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
