import vine from '@vinejs/vine'

/**
 * Shared rules for email and password.
 */
const email = () => vine.string().email().maxLength(254)

/**
 * Strong password policy: at least 12 characters with one lowercase, one
 * uppercase, one digit and one special character.
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/
export const PASSWORD_MIN_LENGTH = 12

export const password = () =>
  vine.string().minLength(PASSWORD_MIN_LENGTH).maxLength(120).regex(PASSWORD_REGEX)

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
  password: password(),
  confirmPassword: vine.string(),
  fullName: vine.string().minLength(2).maxLength(255),
})

/**
 * Validator for the "forgot password" request (sends a reset email).
 */
export const forgotPasswordValidator = vine.create({
  email: email(),
})

/**
 * Validator for actually resetting the password from the emailed token.
 */
export const resetPasswordValidator = vine.create({
  token: vine.string().trim().minLength(1),
  password: password(),
})
