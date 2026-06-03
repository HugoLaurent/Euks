import { randomUUID } from 'node:crypto'
import DownloadAccess from '#models/download_access'
import License from '#models/license'
import PaymentOrder from '#models/payment_order'
import { DateTime } from 'luxon'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export class DownloadAccessService {
  async createAccessesAfterPurchase(
    paymentOrder: PaymentOrder,
    userId: number,
    trx?: TransactionClientContract,
    expirationMonths: number = 12
  ) {
    if (!paymentOrder.trackId || !paymentOrder.licenseId) {
      return
    }

    const license = await License.find(paymentOrder.licenseId)
    const expiresAt = DateTime.now().plus({ months: expirationMonths })

    const fileTypes: Array<'audio' | 'stems' | 'cover' | 'wave'> = ['audio', 'cover']

    if (license?.audioFormats?.includes('wav')) {
      fileTypes.push('wave')
    }

    if (license?.trackSeparation === 'stems') {
      fileTypes.push('stems')
    }

    for (const fileType of fileTypes) {
      const record = new DownloadAccess()
      if (trx) record.useTransaction(trx)

      record.fill({
        userId,
        paymentOrderId: paymentOrder.id,
        trackId: paymentOrder.trackId,
        licenseId: paymentOrder.licenseId,
        fileType,
        expiresAt,
        accessToken: randomUUID(),
      })

      await record.save()
    }
  }

  async getAccessByToken(token: string) {
    return DownloadAccess.query()
      .where('accessToken', token)
      .preload('user')
      .preload('track')
      .preload('license')
      .first()
  }
}

export const downloadAccessService = new DownloadAccessService()
