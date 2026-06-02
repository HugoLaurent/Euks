import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type AudioFormat = 'mp3' | 'wav'
export type TrackSeparation = 'full_mix' | 'stems'
export type TemplateCategory = 'basic' | 'premium' | 'premium_plus' | 'exclusive'

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

  @column({ columnName: 'is_paypal_enabled' })
  declare isPaypalEnabled: boolean

  @column({ columnName: 'is_active' })
  declare isActive: boolean

  @column({ columnName: 'sort_order' })
  declare sortOrder: number

  @column({ columnName: 'price_cents' })
  declare priceCents: number

  @column({
    prepare: prepareJsonArrayValue,
    consume: consumeJsonArrayValue,
  })
  declare audioFormats: AudioFormat[] | null

  @column({ columnName: 'track_separation' })
  declare trackSeparation: TrackSeparation | null

  @column({ columnName: 'max_streams' })
  declare maxStreams: number | null

  @column({ columnName: 'max_sales' })
  declare maxSales: number | null

  @column({ columnName: 'radio_stations' })
  declare radioStations: number | null

  @column({ columnName: 'allow_video_clips' })
  declare allowVideoClips: boolean

  @column({ columnName: 'video_clips_limit' })
  declare videoClipsLimit: number | null

  @column({ columnName: 'allow_live_performance' })
  declare allowLivePerformance: boolean

  @column({ columnName: 'allow_radio_airplay' })
  declare allowRadioAirplay: boolean

  @column({ columnName: 'allow_television' })
  declare allowTelevision: boolean

  @column({ columnName: 'allow_remix' })
  declare allowRemix: boolean

  @column({ columnName: 'allow_monetization' })
  declare allowMonetization: boolean

  @column({ columnName: 'allow_content_id' })
  declare allowContentId: boolean

  @column({ columnName: 'additional_terms' })
  declare additionalTerms: string | null

  @column({ columnName: 'is_template' })
  declare isTemplate: boolean

  @column({ columnName: 'template_category' })
  declare templateCategory: TemplateCategory | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
