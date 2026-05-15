import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import License from '#models/license'
import MusicalKey from '#models/musical_key'
import Tag from '#models/tag'

export default class Track extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column({ columnName: 'cover_image_path' })
  declare coverImagePath: string | null

  @column({ columnName: 'audio_file_path' })
  declare audioFilePath: string | null

  @column({ columnName: 'wave_file_path' })
  declare waveFilePath: string | null

  @column({ columnName: 'zip_file_path' })
  declare zipFilePath: string | null

  @column({ columnName: 'duration_seconds' })
  declare durationSeconds: number | null

  @column()
  declare bpm: number | null

  @column({ columnName: 'musical_key_id' })
  declare musicalKeyId: number | null

  @column({ columnName: 'price_cents' })
  declare priceCents: number

  @column({ columnName: 'listen_count' })
  declare listenCount: number

  @belongsTo(() => MusicalKey)
  declare musicalKey: BelongsTo<typeof MusicalKey>

  @manyToMany(() => Tag, {
    pivotTable: 'track_tags',
    pivotTimestamps: true,
  })
  declare tags: ManyToMany<typeof Tag>

  @manyToMany(() => License, {
    pivotTable: 'track_licenses',
    pivotColumns: ['price_cents', 'is_active'],
    pivotTimestamps: true,
  })
  declare licenses: ManyToMany<typeof License>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
