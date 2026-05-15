import paypalConfig from '#config/paypal'

type PayPalEnvironment = 'sandbox' | 'live'

type PayPalAccessTokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
}

type PayPalOrderPurchaseUnit = {
  reference_id: string
  description: string
  custom_id: string
  amount: {
    currency_code: string
    value: string
  }
}

type PayPalErrorDetail = {
  issue?: string
  description?: string
}

type PayPalErrorResponse = {
  name?: string
  message?: string
  details?: PayPalErrorDetail[]
  debug_id?: string
}

type CreateOrderInput = {
  customId: string
  description: string
  locale: string
  referenceId: string
  value: string
}

let cachedAccessToken:
  | {
      accessToken: string
      expiresAt: number
    }
  | undefined

export class PayPalApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details: PayPalErrorDetail[] = [],
    public debugId?: string,
    public payload?: unknown
  ) {
    super(message)
  }
}

export function getPayPalMissingConfig() {
  const missing: string[] = []

  if (!paypalConfig.clientId) {
    missing.push('PAYPAL_CLIENT_ID')
  }

  if (!paypalConfig.clientSecret) {
    missing.push('PAYPAL_CLIENT_SECRET')
  }

  return missing
}

export function isPayPalConfigured() {
  return getPayPalMissingConfig().length === 0
}

export function getPayPalPublicConfig() {
  return {
    enabled: true,
    environment: paypalConfig.environment,
    clientId: paypalConfig.clientId!,
    currencyCode: paypalConfig.currencyCode,
    buyerCountry: paypalConfig.buyerCountry,
    intent: paypalConfig.intent,
  }
}

function getApiBaseUrl(environment: PayPalEnvironment) {
  return environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
}

async function readJsonSafely(response: Response) {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return responseText
  }
}

function createBasicAuthHeader() {
  const credentials = `${paypalConfig.clientId!}:${paypalConfig.clientSecret!}`
  return `Basic ${Buffer.from(credentials).toString('base64')}`
}

function createPayPalApiError(status: number, payload: unknown) {
  const errorPayload = payload as PayPalErrorResponse | null

  return new PayPalApiError(
    errorPayload?.message ?? 'PayPal request failed',
    status,
    errorPayload?.name,
    errorPayload?.details ?? [],
    errorPayload?.debug_id,
    payload
  )
}

async function getAccessToken() {
  if (!isPayPalConfigured()) {
    throw new PayPalApiError('PayPal is not configured', 503, 'PAYPAL_NOT_CONFIGURED')
  }

  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.accessToken
  }

  const response = await fetch(`${getApiBaseUrl(paypalConfig.environment)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': createBasicAuthHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const payload = (await readJsonSafely(response)) as
    | PayPalAccessTokenResponse
    | PayPalErrorResponse

  if (!response.ok || !payload || typeof payload !== 'object' || !('access_token' in payload)) {
    throw createPayPalApiError(response.status, payload)
  }

  cachedAccessToken = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  }

  return payload.access_token
}

function buildCreateOrderPayload(input: CreateOrderInput) {
  return {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: input.referenceId,
        description: input.description,
        custom_id: input.customId,
        amount: {
          currency_code: paypalConfig.currencyCode,
          value: input.value,
        },
      } satisfies PayPalOrderPurchaseUnit,
    ],
    payment_source: {
      paypal: {
        experience_context: {
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          locale: input.locale,
        },
      },
    },
  }
}

export async function createPayPalOrder(input: CreateOrderInput) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${getApiBaseUrl(paypalConfig.environment)}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify(buildCreateOrderPayload(input)),
  })

  const payload = await readJsonSafely(response)

  if (!response.ok) {
    throw createPayPalApiError(response.status, payload)
  }

  return payload
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `${getApiBaseUrl(paypalConfig.environment)}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        'PayPal-Request-Id': crypto.randomUUID(),
      },
      body: JSON.stringify({}),
    }
  )

  const payload = await readJsonSafely(response)

  if (!response.ok) {
    throw createPayPalApiError(response.status, payload)
  }

  return payload
}

export function formatCurrencyValueFromCents(amountCents: number) {
  return (amountCents / 100).toFixed(2)
}
