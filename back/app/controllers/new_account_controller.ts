import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { signupValidator } from '#validators/user'

export default class NewAccountController {
  /**
   * Signup a new client
   */
  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(signupValidator)

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      return response.unprocessableEntity({
        errors: [
          {
            field: 'confirmPassword',
            message: 'Passwords do not match',
          },
        ],
      })
    }

    // Check if email already exists
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

    try {
      // Create new user with 'client' role
      const user = await User.create({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: 'client',
      })

      // Generate access token for auto-login after signup
      const token = await User.accessTokens.create(user)

      return response.created({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        token: token.value!.release(),
      })
    } catch (error) {
      return response.unprocessableEntity({
        errors: [
          {
            message: error.message || 'Failed to create account',
          },
        ],
      })
    }
  }
}

