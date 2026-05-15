import vine from '@vinejs/vine'

const nonNegativeInteger = () => vine.number().withoutDecimals().nonNegative()
const positiveInteger = () => vine.number().withoutDecimals().positive()

const trackSchema = vine.object({
  title: vine.string().trim().minLength(1).maxLength(255),
  coverImagePath: vine.string().trim().minLength(1).maxLength(2048).nullable().optional(),
  audioFilePath: vine.string().trim().minLength(1).maxLength(2048).nullable().optional(),
  waveFilePath: vine.string().trim().minLength(1).maxLength(2048).nullable().optional(),
  zipFilePath: vine.string().trim().minLength(1).maxLength(2048).nullable().optional(),
  durationSeconds: nonNegativeInteger().nullable().optional(),
  bpm: positiveInteger().nullable().optional(),
  musicalKeyId: positiveInteger().nullable().optional(),
  priceCents: nonNegativeInteger(),
  listenCount: nonNegativeInteger().optional(),
  tagIds: vine.array(positiveInteger()).distinct().optional(),
})

export const createTrackValidator = vine.create(trackSchema)
export const updateTrackValidator = vine.create(trackSchema.partial())
