import { errors as authErrors } from '@adonisjs/auth'
import app from '@adonisjs/core/services/app'
import User from '#models/user'
import { AUTH_COOKIE_NAME } from '#middleware/cookie_token_middleware'
import { ensureSystemUsers, findSystemUserByEmail } from '#services/system_users'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'

export default class AccessTokenController {
  async store({ request, response, serialize }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const managedUser = findSystemUserByEmail(email)

    if (!managedUser) {
      throw new authErrors.E_INVALID_CREDENTIALS('Invalid user credentials')
    }

    await ensureSystemUsers()

    const user = await User.verifyCredentials(managedUser.email, password)
    const token = await User.accessTokens.create(user)
    const tokenValue = token.value!.release()

    // Store the token in an httpOnly cookie so it is not readable by client JS
    // (XSS protection). SameSite=Lax mitigates CSRF; front and back are
    // same-origin (Vite proxy in dev, SPA served by the back in prod).
    response.cookie(AUTH_COOKIE_NAME, tokenValue, {
      httpOnly: true,
      sameSite: 'lax',
      secure: app.inProduction,
      path: '/',
    })

    return serialize({
      user: UserTransformer.transform(user),
      token: tokenValue,
    })
  }

  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }

    response.clearCookie(AUTH_COOKIE_NAME)

    return {
      message: 'Logged out successfully',
    }
  }
}
