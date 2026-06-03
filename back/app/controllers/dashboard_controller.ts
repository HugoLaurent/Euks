import PaymentOrder from '#models/payment_order'
import Track from '#models/track'
import TrackTransformer from '#transformers/track_transformer'
import type { PaymentOrderStatus } from '#models/payment_order'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

const paymentStatuses: PaymentOrderStatus[] = [
  'CREATING',
  'CREATED',
  'APPROVED',
  'COMPLETED',
  'FAILED',
  'VOIDED',
]

export default class DashboardController {
  async summary() {
    const todayStart = DateTime.local().startOf('day').toSQL()

    const monthStart = DateTime.local().startOf('month').toSQL()

    const [
      purchasesTodayCount,
      revenueTodaySum,
      purchasesMonthCount,
      revenueMonthSum,
      completedPurchasesCount,
      totalRevenueSum,
      totalTracksCount,
      activeTracksCount,
      hiddenTracksCount,
      soldTracksCount,
      recentPurchases,
    ] = await Promise.all([
      this.countPayments({ status: 'COMPLETED', since: todayStart }),
      this.sumPayments({ status: 'COMPLETED', since: todayStart }),
      this.countPayments({ status: 'COMPLETED', since: monthStart }),
      this.sumPayments({ status: 'COMPLETED', since: monthStart }),
      this.countPayments({ status: 'COMPLETED' }),
      this.sumPayments({ status: 'COMPLETED' }),
      this.countTracks(),
      this.countTracks({ isActive: true }),
      this.countTracks({ isActive: false }),
      this.countTracks({ isSold: true }),
      PaymentOrder.query()
        .preload('track')
        .preload('license')
        .orderBy('created_at', 'desc')
        .limit(5),
    ])

    return {
      stats: {
        purchasesToday: purchasesTodayCount,
        revenueTodayCents: revenueTodaySum,
        purchasesMonth: purchasesMonthCount,
        revenueMonthCents: revenueMonthSum,
        completedPurchases: completedPurchasesCount,
        totalRevenueCents: totalRevenueSum,
        totalTracks: totalTracksCount,
        activeTracks: activeTracksCount,
        hiddenTracks: hiddenTracksCount,
        soldTracks: soldTracksCount,
      },
      recentPurchases: recentPurchases.map((paymentOrder) =>
        this.serializePaymentOrder(paymentOrder)
      ),
    }
  }

  async purchases({ request, response }: HttpContext) {
    const page = this.parsePositiveInteger(request.input('page'), 1)
    const perPage = this.parsePositiveInteger(request.input('perPage'), 12)
    const status = request.input('status', 'all')

    if (page === null) {
      return this.validationError(response, 'page', 'Page must be a positive integer')
    }

    if (perPage === null) {
      return this.validationError(response, 'perPage', 'Per page must be a positive integer')
    }

    if (status !== 'all' && !this.isPaymentStatus(status)) {
      return this.validationError(response, 'status', 'Unknown payment status')
    }

    const query = PaymentOrder.query().orderBy('created_at', 'desc')

    if (status !== 'all') {
      query.where('status', status)
    }

    const payments = await query.paginate(page, Math.min(perPage, 100))

    return {
      data: payments.all().map((paymentOrder) => this.serializePaymentOrder(paymentOrder)),
      meta: payments.getMeta(),
    }
  }

  async tracks({ request, response, serialize }: HttpContext) {
    const page = this.parsePositiveInteger(request.input('page'), 1)
    const perPage = this.parsePositiveInteger(request.input('perPage'), 12)
    const status = request.input('status', 'all')
    const search = request.input('search')

    if (page === null) {
      return this.validationError(response, 'page', 'Page must be a positive integer')
    }

    if (perPage === null) {
      return this.validationError(response, 'perPage', 'Per page must be a positive integer')
    }

    if (!['all', 'active', 'hidden', 'sold', 'available'].includes(status)) {
      return this.validationError(response, 'status', 'Unknown track status')
    }

    if (search !== undefined && typeof search !== 'string') {
      return this.validationError(response, 'search', 'Search must be a string')
    }

    const query = Track.query()
      .preload('licenses', (licensesQuery) => licensesQuery.orderBy('sort_order').orderBy('title'))
      .preload('musicalKey')
      .preload('tags', (tagsQuery) => tagsQuery.orderBy('type').orderBy('name'))
      .orderBy('created_at', 'desc')

    if (status === 'active') {
      query.where('is_active', true)
    }

    if (status === 'hidden') {
      query.where('is_active', false)
    }

    if (status === 'sold') {
      query.where('is_sold', true)
    }

    if (status === 'available') {
      query.where('is_active', true).where('is_sold', false)
    }

    if (search?.trim()) {
      query.whereRaw('LOWER(title) LIKE ?', [`%${search.trim().toLowerCase()}%`])
    }

    const tracks = await query.paginate(page, Math.min(perPage, 100))

    return serialize(TrackTransformer.paginate(tracks.all(), tracks.getMeta()))
  }

  private serializePaymentOrder(paymentOrder: PaymentOrder) {
    return {
      id: paymentOrder.id,
      provider: paymentOrder.provider,
      trackId: paymentOrder.trackId,
      licenseId: paymentOrder.licenseId,
      licenseIdSnapshot: paymentOrder.licenseIdSnapshot,
      trackTitle: paymentOrder.trackTitleSnapshot,
      licenseTitle: paymentOrder.licenseTitleSnapshot,
      amountCents: paymentOrder.amountCents,
      currencyCode: paymentOrder.currencyCode,
      status: paymentOrder.status,
      paypalOrderId: paymentOrder.paypalOrderId,
      paypalCaptureId: paymentOrder.paypalCaptureId,
      payerEmail: paymentOrder.payerEmail,
      createdAt: paymentOrder.createdAt,
      updatedAt: paymentOrder.updatedAt,
    }
  }

  private async countPayments(
    options: { status?: PaymentOrderStatus; since?: string | null } = {}
  ) {
    const query = PaymentOrder.query()

    if (options.status) {
      query.where('status', options.status)
    }

    if (options.since) {
      query.where('created_at', '>=', options.since)
    }

    const result = await query.count('* as total').first()
    return Number(result?.$extras.total ?? 0)
  }

  private async sumPayments(options: { status?: PaymentOrderStatus; since?: string | null } = {}) {
    const query = PaymentOrder.query()

    if (options.status) {
      query.where('status', options.status)
    }

    if (options.since) {
      query.where('created_at', '>=', options.since)
    }

    const result = await query.sum('amount_cents as total').first()
    return Number(result?.$extras.total ?? 0)
  }

  private async countTracks(options: { isActive?: boolean; isSold?: boolean } = {}) {
    const query = Track.query()

    if (options.isActive !== undefined) {
      query.where('is_active', options.isActive)
    }

    if (options.isSold !== undefined) {
      query.where('is_sold', options.isSold)
    }

    const result = await query.count('* as total').first()
    return Number(result?.$extras.total ?? 0)
  }

  private parsePositiveInteger(value: unknown, fallback: number) {
    if (value === undefined || value === null || value === '') {
      return fallback
    }

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null
    }

    return parsed
  }

  private validationError(response: HttpContext['response'], field: string, message: string) {
    return response.status(422).send({
      message,
      errors: [{ field, message }],
    })
  }

  private isPaymentStatus(value: unknown): value is PaymentOrderStatus {
    return typeof value === 'string' && paymentStatuses.includes(value as PaymentOrderStatus)
  }
}
