import vine from '@vinejs/vine'

export const tagTypes = ['mood', 'genre'] as const

const tagSchema = vine.object({
  name: vine.string().trim().minLength(1).maxLength(120),
  slug: vine.string().trim().minLength(1).maxLength(140).optional(),
  type: vine.enum(tagTypes),
})

export const createTagValidator = vine.create(tagSchema)
export const updateTagValidator = vine.create(tagSchema.partial())
