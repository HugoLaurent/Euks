import vine from '@vinejs/vine'
import { password } from '#validators/user'

export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(255).optional(),
  email: vine.string().email().maxLength(254).optional(),
  currentPassword: vine.string().minLength(1).optional(),
  newPassword: password().optional(),
})

export const deleteAccountValidator = vine.create({
  password: vine.string().minLength(1),
})
