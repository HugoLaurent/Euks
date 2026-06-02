import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export const AUTH_COOKIE_NAME = 'euks_token'

/**
 * Bridges the httpOnly auth cookie to the `Authorization` header so the
 * existing access-tokens guard keeps working unchanged. The token is stored in
 * an httpOnly cookie (set on login) instead of being readable by client JS.
 */
export default class CookieTokenMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!ctx.request.header('authorization')) {
      const token = ctx.request.cookie(AUTH_COOKIE_NAME)

      if (token) {
        ctx.request.request.headers['authorization'] = `Bearer ${token}`
      }
    }

    return next()
  }
}
