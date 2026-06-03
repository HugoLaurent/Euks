import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import PaymentOrder from '#models/payment_order'
import Track from '#models/track'
import License from '#models/license'

export default class DownloadAccess extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare paymentOrderId: number

  @column()
  declare trackId: number

  @column()
  declare licenseId: number

  @column()
  declare fileType: 'audio' | 'stems' | 'cover' | 'wave'

  @column()
  declare downloadCount: number

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare accessToken: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => PaymentOrder)
  declare paymentOrder: BelongsTo<typeof PaymentOrder>

  @belongsTo(() => Track)
  declare track: BelongsTo<typeof Track>

  @belongsTo(() => License)
  declare license: BelongsTo<typeof License>

  /**
   * Vérifie si l'accès n'a pas expiré
   */
  isValid(): boolean {
    if (!this.expiresAt) return true
    return this.expiresAt > DateTime.now()
  }
}
