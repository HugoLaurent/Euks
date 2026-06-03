import { randomUUID } from 'node:crypto'
import DownloadAccess from '#models/download_access'
import PaymentOrder from '#models/payment_order'
import { DateTime } from 'luxon'

/**
 * Service for managing download access permissions
 */
export class DownloadAccessService {
  /**
   * Create download accesses after a successful purchase
   */
  async createAccessesAfterPurchase(
    paymentOrder: PaymentOrder,
    userId: number | null = null,
    expirationMonths: number = 12
  ) {
    if (!paymentOrder.trackId || !paymentOrder.licenseId) {
      return
    }

    const expiresAt = DateTime.now().plus({ months: expirationMonths })

    // Create download access for audio file
    await DownloadAccess.create({
      userId: userId || null,
      paymentOrderId: paymentOrder.id,
      trackId: paymentOrder.trackId,
      licenseId: paymentOrder.licenseId,
      fileType: 'audio',
      expiresAt,
      accessToken: randomUUID(),
    })

    // Create download access for stems if available
    await DownloadAccess.create({
      userId: userId || null,
      paymentOrderId: paymentOrder.id,
      trackId: paymentOrder.trackId,
      licenseId: paymentOrder.licenseId,
      fileType: 'stems',
      expiresAt,
      accessToken: randomUUID(),
    })

    // Create download access for cover
    await DownloadAccess.create({
      userId: userId || null,
      paymentOrderId: paymentOrder.id,
      trackId: paymentOrder.trackId,
      licenseId: paymentOrder.licenseId,
      fileType: 'cover',
      expiresAt,
      accessToken: randomUUID(),
    })

    // Create download access for wave file
    await DownloadAccess.create({
      userId: userId || null,
      paymentOrderId: paymentOrder.id,
      trackId: paymentOrder.trackId,
      licenseId: paymentOrder.licenseId,
      fileType: 'wave',
      expiresAt,
      accessToken: randomUUID(),
    })
  }

  /**
   * Get download access by token
   */
  async getAccessByToken(token: string) {
    return DownloadAccess.query()
      .where('accessToken', token)
      .preload('user')
      .preload('track')
      .preload('license')
      .first()
  }

  /**
   * Verify if user has access to download a file
   */
  async hasAccess(
    userId: number | null,
    paymentOrderId: number,
    fileType: 'audio' | 'stems' | 'cover' | 'wave'
  ): Promise<boolean> {
    const access = await DownloadAccess.query()
      .where('paymentOrderId', paymentOrderId)
      .where('fileType', fileType)
      .if(userId, (query) => query.where('userId', userId))
      .first()

    if (!access) return false
    return access.isValid()
  }

  /**
   * Increment download count
   */
  async recordDownload(accessId: number) {
    const access = await DownloadAccess.find(accessId)
    if (access) {
      access.downloadCount += 1
      await access.save()
    }
  }
}

export const downloadAccessService = new DownloadAccessService()
