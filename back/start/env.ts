/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Uploads
  UPLOAD_MULTIPART_LIMIT: Env.schema.string.optional(),

  // Database
  DB_CONNECTION: Env.schema.enum(['sqlite', 'pg'] as const),
  DB_HOST: Env.schema.string.optional(),
  DB_PORT: Env.schema.number.optional(),
  DB_USER: Env.schema.string.optional(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),

  // System users
  ADMIN_EMAIL: Env.schema.string({ format: 'email' }),
  ADMIN_PASSWORD: Env.schema.string(),
  ADMIN_FULL_NAME: Env.schema.string.optional(),
  OWNER_EMAIL: Env.schema.string({ format: 'email' }),
  OWNER_PASSWORD: Env.schema.string(),
  OWNER_FULL_NAME: Env.schema.string.optional(),

  // PayPal
  PAYPAL_ENVIRONMENT: Env.schema.string.optional(),
  PAYPAL_CLIENT_ID: Env.schema.string.optional(),
  PAYPAL_CLIENT_SECRET: Env.schema.string.optional(),
  PAYPAL_CURRENCY_CODE: Env.schema.string.optional(),
  PAYPAL_CURRENCY: Env.schema.string.optional(),
  PAYPAL_BUYER_COUNTRY: Env.schema.string.optional(),
  PAYPAL_DEFAULT_LOCALE: Env.schema.string.optional(),
})
