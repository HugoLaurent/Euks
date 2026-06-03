import { createHash, randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import User from '#models/user'
import PasswordResetToken from '#models/password_reset_token'
import { forgotPasswordValidator, resetPasswordValidator } from '#validators/user'
import { sendPasswordReset } from '#services/email_service'
import type { HttpContext } from '@adonisjs/core/http'

function hashToken(rawToken: string) {
  return createHash('sha256').update(rawToken).digest('hex')
}

export default class PasswordResetController {
  /**
   * Request a password reset link by email.
   */
  async forgot({ request, response }: HttpContext) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    const user = await User.findBy('email', email)

    if (user) {
      // Invalidate any previous tokens for this user.
      await PasswordResetToken.query().where('user_id', user.id).delete()

      const rawToken = randomBytes(32).toString('hex')
      await PasswordResetToken.create({
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: DateTime.now().plus({ hours: 1 }),
      })

      // Fire-and-forget: an email failure must not reveal whether the account exists.
      sendPasswordReset({ to: user.email, token: rawToken }).catch((err) => {
        console.error('[email] sendPasswordReset failed:', err?.message)
      })
    }

    // Always return the same response so we never leak which emails are registered.
    return response.ok({
      message: 'Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.',
    })
  }

  /**
   * Reset the password using the emailed token.
   */
  async reset({ request, response }: HttpContext) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    const record = await PasswordResetToken.query()
      .where('token_hash', hashToken(token))
      .preload('user')
      .first()

    if (!record || record.isExpired() || !record.user) {
      return response.unprocessableEntity({
        errors: [
          { field: 'token', message: 'Ce lien de réinitialisation est invalide ou a expiré.' },
        ],
      })
    }

    record.user.password = password
    await record.user.save()

    // One-time use: drop every token for this user once consumed.
    await PasswordResetToken.query().where('user_id', record.userId).delete()

    return response.ok({
      message: 'Mot de passe mis à jour. Tu peux maintenant te connecter.',
    })
  }
}
