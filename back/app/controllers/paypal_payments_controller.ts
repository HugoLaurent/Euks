import paypalConfig from '#config/paypal'
import PaymentOrder from '#models/payment_order'
import type { PaymentOrderStatus } from '#models/payment_order'
import {
  formatCurrencyValueFromCents,
  PayPalApiError,
  capturePayPalOrder,
  createPayPalOrder,
  getPayPalMissingConfig,
  getPayPalPublicConfig,
  isPayPalConfigured,
} from '#services/paypal_service'
import { resolveCheckoutLicense } from '#services/licensing_service'
import { downloadAccessService } from '#services/download_access_service'
import { sendPurchaseConfirmation } from '#services/email_service'
import { capturePayPalOrderValidator, createPayPalOrderValidator } from '#validators/paypal'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

type CaptureResponse = {
  id?: string
  status?: string
  payer?: {
    email_address?: string
  }
  purchase_units?: Array<{
    reference_id?: string
    payments?: {
      captures?: Array<{
        id?: string
        status?: string
        amount?: {
          currency_code?: string
          value?: string
        }
      }>
    }
  }>
}

type CreateOrderResponse = {
  id?: string
  status?: string
}

export default class PaypalPaymentsController {
  async config({ response }: HttpContext) {
    if (!isPayPalConfigured()) {
      return response.status(503).send({
        enabled: false,
        message: 'PayPal is not configured',
        missing: getPayPalMissingConfig(),
      })
    }

    return getPayPalPublicConfig()
  }

  async createOrder({ request, response, auth }: HttpContext) {
    if (!isPayPalConfigured()) {
      return response.status(503).send({
        enabled: false,
        message: 'PayPal is not configured',
        missing: getPayPalMissingConfig(),
      })
    }

    const user = await auth.authenticate()
    const payload = await request.validateUsing(createPayPalOrderValidator)
    const resolution = await resolveCheckoutLicense(payload.trackId, payload.licenseId)

    if (resolution.kind === 'track_not_found') {
      return this.errorResponse(response, 404, 'Track not found', 'TRACK_NOT_FOUND')
    }

    if (resolution.kind === 'track_unavailable') {
      return this.errorResponse(
        response,
        409,
        'This track is not available for purchase',
        'TRACK_NOT_AVAILABLE'
      )
    }

    if (resolution.kind === 'track_sold') {
      return this.errorResponse(response, 409, 'This track has already been sold', 'TRACK_SOLD')
    }

    if (resolution.kind === 'license_invalid') {
      return this.errorResponse(response, 422, 'Invalid license', 'LICENSE_INVALID')
    }

    if (resolution.kind === 'license_unavailable') {
      if (!resolution.license.isPaypalEnabled) {
        return this.errorResponse(
          response,
          409,
          'This license requires a negotiated quote',
          'LICENSE_NOT_PAYABLE'
        )
      }

      return this.errorResponse(
        response,
        409,
        'This license is not available for this track',
        'LICENSE_NOT_AVAILABLE'
      )
    }

    if (!resolution.license.isPaypalEnabled) {
      return this.errorResponse(
        response,
        409,
        'This license requires a negotiated quote',
        'LICENSE_NOT_PAYABLE'
      )
    }

    const paymentOrder = await PaymentOrder.create({
      provider: 'paypal',
      userId: user.id,
      trackId: resolution.track.id,
      licenseId: resolution.license.id,
      trackTitleSnapshot: resolution.track.title,
      licenseIdSnapshot: resolution.license.id,
      licenseTitleSnapshot: resolution.license.title,
      amountCents: resolution.priceCents,
      currencyCode: paypalConfig.currencyCode,
      status: 'CREATING',
      requestPayload: JSON.stringify(payload),
    })

    try {
      const createOrderResponse = (await createPayPalOrder({
        customId: `payment-order:${paymentOrder.id}`,
        description: `${resolution.track.title} - ${resolution.license.title}`,
        locale: payload.locale ?? paypalConfig.defaultLocale,
        referenceId: String(resolution.license.id),
        value: formatCurrencyValueFromCents(resolution.priceCents),
      })) as CreateOrderResponse

      paymentOrder.merge({
        status: this.toPaymentOrderStatus(createOrderResponse.status, 'CREATED'),
        paypalOrderId: createOrderResponse.id ?? null,
        orderPayload: JSON.stringify(createOrderResponse),
        errorPayload: null,
      })

      await paymentOrder.save()

      return {
        id: createOrderResponse.id,
        status: createOrderResponse.status,
        amount: {
          currencyCode: paypalConfig.currencyCode,
          value: formatCurrencyValueFromCents(resolution.priceCents),
        },
        track: {
          id: resolution.track.id,
          title: resolution.track.title,
        },
        license: {
          id: resolution.license.id,
          title: resolution.license.title,
        },
      }
    } catch (error) {
      paymentOrder.merge({
        status: 'FAILED',
        errorPayload: JSON.stringify(this.normalizeErrorPayload(error)),
      })

      await paymentOrder.save()

      return this.handlePayPalError(response, error, 'PayPal order creation failed', false)
    }
  }

  async captureOrder({ params, request, response, auth }: HttpContext) {
    if (!isPayPalConfigured()) {
      return response.status(503).send({
        enabled: false,
        message: 'PayPal is not configured',
        missing: getPayPalMissingConfig(),
      })
    }

    const payload = await request.validateUsing(capturePayPalOrderValidator)
    const user = await auth.authenticate()

    return await db.transaction(async (trx) => {
      const paymentOrder = await PaymentOrder.query({ client: trx })
        .where('paypalOrderId', params.orderId)
        .forUpdate()
        .first()

      if (!paymentOrder) {
        return this.errorResponse(response, 404, 'PayPal order not found', 'ORDER_NOT_FOUND')
      }

      if (payload.trackId !== undefined && paymentOrder.trackId !== payload.trackId) {
        return this.errorResponse(
          response,
          409,
          'Order does not match this track',
          'ORDER_TRACK_MISMATCH'
        )
      }

      if (payload.licenseId !== undefined && paymentOrder.licenseIdSnapshot !== payload.licenseId) {
        return this.errorResponse(
          response,
          409,
          'Order does not match this license',
          'ORDER_LICENSE_MISMATCH'
        )
      }

      if (paymentOrder.userId !== null && paymentOrder.userId !== user.id) {
        return this.errorResponse(
          response,
          403,
          'This order does not belong to you',
          'ORDER_FORBIDDEN'
        )
      }

      if (paymentOrder.paypalCaptureId || paymentOrder.status === 'COMPLETED') {
        return this.errorResponse(
          response,
          409,
          'PayPal order already captured',
          'ORDER_ALREADY_CAPTURED'
        )
      }

      try {
        const captureResponse = (await capturePayPalOrder(params.orderId)) as CaptureResponse
        const firstCapture = captureResponse.purchase_units?.[0]?.payments?.captures?.[0]
        const payerEmail = captureResponse.payer?.email_address ?? null

        paymentOrder.useTransaction(trx)
        paymentOrder.merge({
          userId: user.id,
          status: this.toPaymentOrderStatus(
            captureResponse.status ?? firstCapture?.status,
            'COMPLETED'
          ),
          paypalCaptureId: firstCapture?.id ?? paymentOrder.paypalCaptureId,
          payerEmail,
          capturePayload: JSON.stringify(captureResponse),
          errorPayload: null,
        })

        await paymentOrder.save()

        await downloadAccessService.createAccessesAfterPurchase(paymentOrder, user.id, trx)

        // Envoi du mail de confirmation (fire-and-forget — une erreur email
        // ne doit pas faire échouer la transaction)
        if (user.email && payerEmail) {
          sendPurchaseConfirmation({
            to: user.email,
            trackTitle: paymentOrder.trackTitleSnapshot,
            licenseTitle: paymentOrder.licenseTitleSnapshot,
            amountCents: paymentOrder.amountCents,
            currency: paymentOrder.currencyCode,
            orderId: paymentOrder.paypalOrderId ?? String(paymentOrder.id),
          }).catch((err) => {
            console.error('[email] sendPurchaseConfirmation failed:', err?.message)
          })
        }

        return {
          id: captureResponse.id,
          status: captureResponse.status,
          payer: captureResponse.payer,
          purchase_units: captureResponse.purchase_units,
        }
      } catch (error) {
        paymentOrder.useTransaction(trx)
        paymentOrder.merge({
          status: 'FAILED',
          errorPayload: JSON.stringify(this.normalizeErrorPayload(error)),
        })

        await paymentOrder.save()

        return this.handlePayPalError(response, error, 'PayPal capture failed', true)
      }
    })
  }

  private handlePayPalError(
    response: HttpContext['response'],
    error: unknown,
    fallbackMessage: string,
    preserveRemoteClientError: boolean
  ) {
    if (error instanceof PayPalApiError) {
      const status =
        preserveRemoteClientError && error.status >= 400 && error.status < 500
          ? error.status
          : error.status === 503
            ? 503
            : 502

      return response.status(status).send({
        message: fallbackMessage,
        code: error.code,
        details: error.details,
        debug_id: error.debugId,
      })
    }

    return response.status(502).send({
      message: fallbackMessage,
      code: 'PAYPAL_REQUEST_FAILED',
      details: [],
    })
  }

  private errorResponse(
    response: HttpContext['response'],
    status: number,
    message: string,
    code: string,
    details: unknown[] = []
  ) {
    return response.status(status).send({
      message,
      code,
      details,
    })
  }

  private normalizeErrorPayload(error: unknown) {
    if (error instanceof PayPalApiError) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
        debugId: error.debugId,
        payload: error.payload,
      }
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      }
    }

    return {
      message: 'Unknown error',
    }
  }

  private toPaymentOrderStatus(value: string | undefined, fallback: PaymentOrderStatus) {
    const normalizedValue = value?.toUpperCase()

    switch (normalizedValue) {
      case 'CREATING':
      case 'CREATED':
      case 'APPROVED':
      case 'COMPLETED':
      case 'FAILED':
      case 'VOIDED':
        return normalizedValue
      default:
        return fallback
    }
  }
}
