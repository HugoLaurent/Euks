import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import PaymentOrder from '#models/payment_order'
import DownloadAccess from '#models/download_access'
import Track from '#models/track'
import { DateTime } from 'luxon'

export default class ClientDashboardController {
  /**
   * Get user's purchase history
   */
  async purchases({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const page = this.parsePositiveInteger(request.input('page'), 1)
    const perPage = this.parsePositiveInteger(request.input('perPage'), 12)

    if (page === null) {
      return this.validationError(response, 'page', 'Page must be a positive integer')
    }

    if (perPage === null) {
      return this.validationError(response, 'perPage', 'Per page must be a positive integer')
    }

    const query = PaymentOrder.query()
      .where('user_id', user.id)
      .where('status', 'COMPLETED')
      .orderBy('created_at', 'desc')

    const purchases = await query
      .preload('track')
      .preload('license')
      .paginate(page, Math.min(perPage, 100))

    return {
      data: purchases.all().map((purchase) => ({
        id: purchase.id,
        trackId: purchase.trackId,
        licenseId: purchase.licenseId,
        track: {
          id: purchase.track?.id,
          title: purchase.trackTitleSnapshot,
        },
        license: {
          id: purchase.licenseId,
          title: purchase.licenseTitleSnapshot,
        },
        amount: purchase.amountCents,
        currency: purchase.currencyCode,
        purchasedAt: purchase.createdAt?.toISO(),
      })),
      meta: purchases.getMeta(),
    }
  }

  /**
   * Get user's available downloads
   */
  async downloads({ auth, request, response }: HttpContext) {
    const user = await auth.authenticate()
    const page = this.parsePositiveInteger(request.input('page'), 1)
    const perPage = this.parsePositiveInteger(request.input('perPage'), 12)

    if (page === null) {
      return this.validationError(response, 'page', 'Page must be a positive integer')
    }

    if (perPage === null) {
      return this.validationError(response, 'perPage', 'Per page must be a positive integer')
    }

    const query = DownloadAccess.query()
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')

    const accesses = await query
      .preload('track')
      .preload('license')
      .preload('paymentOrder')
      .paginate(page, Math.min(perPage, 100))

    return {
      data: accesses.all().map((access) => ({
        id: access.id,
        trackId: access.trackId,
        licenseId: access.licenseId,
        fileType: access.fileType,
        track: {
          id: access.track?.id,
          title: access.track?.title,
        },
        license: {
          id: access.license?.id,
          title: access.license?.title,
        },
        downloadCount: access.downloadCount,
        expiresAt: access.expiresAt?.toISO(),
        isValid: access.isValid(),
        accessToken: access.accessToken,
      })),
      meta: accesses.getMeta(),
    }
  }

  /**
   * Download a file using access token
   */
  async download({ params, response }: HttpContext) {
    const access = await DownloadAccess.query()
      .where('accessToken', params.token)
      .preload('track')
      .first()

    if (!access) {
      return response.notFound({
        message: 'Access denied or file not found',
      })
    }

    if (!access.isValid()) {
      return response.status(410).send({
        message: 'Download access has expired',
      })
    }

    if (!access.track) {
      return response.notFound({
        message: 'Track not found',
      })
    }

    // Determine file path based on fileType.
    // Cover and preview audio live in public/; wave and stems live in storage/.
    let absoluteFilePath: string | null = null
    let fileName: string = ''

    switch (access.fileType) {
      case 'audio':
        absoluteFilePath = access.track.audioFilePath
          ? app.publicPath(access.track.audioFilePath.replace(/^\//, ''))
          : null
        fileName = `${access.track.title}.mp3`
        break
      case 'stems':
        absoluteFilePath = access.track.zipFilePath
          ? app.makePath('storage', access.track.zipFilePath)
          : null
        fileName = `${access.track.title}-stems.zip`
        break
      case 'cover':
        absoluteFilePath = access.track.coverImagePath
          ? app.publicPath(access.track.coverImagePath.replace(/^\//, ''))
          : null
        fileName = `${access.track.title}-cover.jpg`
        break
      case 'wave':
        absoluteFilePath = access.track.waveFilePath
          ? app.makePath('storage', access.track.waveFilePath)
          : null
        fileName = `${access.track.title}-wave.wav`
        break
    }

    if (!absoluteFilePath) {
      return response.notFound({ message: 'File not found' })
    }

    await DownloadAccess.query().where('id', access.id).increment('downloadCount', 1)

    return response.download(absoluteFilePath, fileName)
  }

  /**
   * Parse and validate positive integer from request
   */
  private parsePositiveInteger(value: any, defaultValue: number): number | null {
    const parsed = parseInt(value ?? defaultValue, 10)
    if (isNaN(parsed) || parsed < 1) {
      return null
    }
    return parsed
  }

  /**
   * Return validation error response
   */
  private validationError(response: HttpContext['response'], field: string, message: string) {
    return response.badRequest({
      errors: [
        {
          field,
          message,
        },
      ],
    })
  }
}
