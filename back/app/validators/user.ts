import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)

/**
 * Validator to use before validating user credentials
 * during login
 */
export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})

/**
 * Validator for user registration/signup
 */
export const signupValidator = vine.create({
  email: email(),
  password: vine.string().minLength(8),
  confirmPassword: vine.string(),
  fullName: vine.string().minLength(2).maxLength(255),
})

