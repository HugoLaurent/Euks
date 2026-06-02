import vine from '@vinejs/vine'

export const audioFormatsEnum = ['mp3', 'wav'] as const
export const trackSeparationEnum = ['full_mix', 'stems'] as const
export const templateCategoryEnum = ['basic', 'premium', 'premium_plus', 'exclusive'] as const

const baseLicenseSchema = vine.object({
  title: vine.string().trim().minLength(1).maxLength(160),
  description: vine.string().trim().maxLength(1000).nullable().optional(),
  isPaypalEnabled: vine.boolean().optional(),
  isActive: vine.boolean().optional(),
  sortOrder: vine.number().withoutDecimals().nonNegative().optional(),
  priceCents: vine.number().withoutDecimals().nonNegative().optional(),
  audioFormats: vine.array(vine.enum(audioFormatsEnum)).nullable().optional(),
  trackSeparation: vine.enum(trackSeparationEnum).nullable().optional(),
  maxStreams: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  maxSales: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  radioStations: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  allowVideoClips: vine.boolean().optional(),
  videoClipsLimit: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  allowLivePerformance: vine.boolean().optional(),
  allowRadioAirplay: vine.boolean().optional(),
  allowTelevision: vine.boolean().optional(),
  allowRemix: vine.boolean().optional(),
  allowMonetization: vine.boolean().optional(),
  allowContentId: vine.boolean().optional(),
  additionalTerms: vine.string().trim().maxLength(2000).nullable().optional(),
  isTemplate: vine.boolean().optional(),
  templateCategory: vine.enum(templateCategoryEnum).nullable().optional(),
})

export const createLicenseValidator = vine.create(baseLicenseSchema)
export const updateLicenseValidator = vine.create(baseLicenseSchema.partial())
