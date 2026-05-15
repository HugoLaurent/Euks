import vine from '@vinejs/vine'

const musicalKeySchema = vine.object({
  name: vine.string().trim().minLength(1).maxLength(100),
  slug: vine.string().trim().minLength(1).maxLength(120).optional(),
})

export const createMusicalKeyValidator = vine.create(musicalKeySchema)
export const updateMusicalKeyValidator = vine.create(musicalKeySchema.partial())
