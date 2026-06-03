import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import License from '#models/license'
import Track from '#models/track'
import User from '#models/user'
import DownloadAccess from '#models/download_access'

export type PaymentProvider = 'paypal'
export type PaymentOrderStatus =
  | 'CREATING'
  | 'CREATED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'VOIDED'

export default class PaymentOrder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare provider: PaymentProvider

  @column({ columnName: 'track_id' })
  declare trackId: number | null

  @column({ columnName: 'license_id' })
  declare licenseId: number | null

  @column({ columnName: 'license_id_snapshot' })
  declare licenseIdSnapshot: number | null

  @column({ columnName: 'track_title_snapshot' })
  declare trackTitleSnapshot: string

  @column({ columnName: 'license_title_snapshot' })
  declare licenseTitleSnapshot: string

  @column({ columnName: 'amount_cents' })
  declare amountCents: number

  @column({ columnName: 'currency_code' })
  declare currencyCode: string

  @column()
  declare status: PaymentOrderStatus

  @column({ columnName: 'paypal_order_id' })
  declare paypalOrderId: string | null

  @column({ columnName: 'paypal_capture_id' })
  declare paypalCaptureId: string | null

  @column({ columnName: 'payer_email' })
  declare payerEmail: string | null

  @column({ columnName: 'request_payload' })
  declare requestPayload: string | null

  @column({ columnName: 'order_payload' })
  declare orderPayload: string | null

  @column({ columnName: 'capture_payload' })
  declare capturePayload: string | null

  @column({ columnName: 'error_payload' })
  declare errorPayload: string | null

  @belongsTo(() => Track)
  declare track: BelongsTo<typeof Track>

  @belongsTo(() => License)
  declare license: BelongsTo<typeof License>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => DownloadAccess)
  declare downloadAccesses: HasMany<typeof DownloadAccess>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
