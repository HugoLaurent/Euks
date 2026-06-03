import UserTransformer from '#transformers/user_transformer'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { deleteAccountValidator, updateProfileValidator } from '#validators/profile'
import hash from '@adonisjs/core/services/hash'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }

  /**
   * Update user profile
   */
  async update({ auth, request, response }: HttpContext) {
    const user = auth.user!

    const data = await request.validateUsing(updateProfileValidator)

    try {
      // Update email if provided
      if (data.email && data.email !== user.email) {
        const existingUser = await User.findBy('email', data.email)
        if (existingUser) {
          return response.unprocessableEntity({
            errors: [
              {
                field: 'email',
                message: 'Email already in use',
              },
            ],
          })
        }
        user.email = data.email
      }

      // Update fullName if provided
      if (data.fullName) {
        user.fullName = data.fullName
      }

      if (data.newPassword) {
        if (!data.currentPassword) {
          return response.unprocessableEntity({
            errors: [
              {
                field: 'currentPassword',
                message: 'Current password is required to set new password',
              },
            ],
          })
        }

        // Verify current password
        const isValid = await hash.verify(user.password, data.currentPassword)
        if (!isValid) {
          return response.unprocessableEntity({
            errors: [
              {
                field: 'currentPassword',
                message: 'Current password is incorrect',
              },
            ],
          })
        }

        user.password = data.newPassword
      }

      await user.save()

      return response.ok({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to update profile',
      })
    }
  }

  /**
   * Delete user account (RGPD - right to be forgotten)
   */
  async delete({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { password } = await request.validateUsing(deleteAccountValidator)

    try {
      const isValid = await hash.verify(user.password, password)
      if (!isValid) {
        return response.unprocessableEntity({
          errors: [
            {
              field: 'password',
              message: 'Password is incorrect',
            },
          ],
        })
      }

      // Delete user and related data
      await user.delete()

      return response.ok({
        message: 'Account deleted successfully',
      })
    } catch (error) {
      return response.internalServerError({
        message: 'Failed to delete account',
      })
    }
  }
}
