import vine from '@vinejs/vine'

/**
 * Validator for profile update
 */
export const updateProfileValidator = vine.create({
  fullName: vine.string().minLength(2).maxLength(255).optional(),
  email: vine.string().email().maxLength(254).optional(),
  currentPassword: vine.string().minLength(8).optional(),
  newPassword: vine.string().minLength(8).optional(),
})
