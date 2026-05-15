import env from '#start/env'

export type PayPalEnvironment = 'sandbox' | 'live'

function normalizeOptionalString(value: string | undefined) {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : undefined
}

function normalizeEnvironment(value: string | undefined): PayPalEnvironment {
  return value === 'live' ? 'live' : 'sandbox'
}

const environment = normalizeEnvironment(env.get('PAYPAL_ENVIRONMENT'))
const clientId = normalizeOptionalString(env.get('PAYPAL_CLIENT_ID'))
const clientSecret = normalizeOptionalString(env.get('PAYPAL_CLIENT_SECRET'))
const currencyCode = (
  env.get('PAYPAL_CURRENCY_CODE') ?? env.get('PAYPAL_CURRENCY') ?? 'EUR'
).toUpperCase()

const paypalConfig = {
  environment,
  clientId,
  clientSecret,
  currencyCode,
  buyerCountry: (env.get('PAYPAL_BUYER_COUNTRY') ?? 'FR').toUpperCase(),
  defaultLocale: env.get('PAYPAL_DEFAULT_LOCALE') ?? 'fr-FR',
  intent: 'capture' as const,
}

export default paypalConfig
