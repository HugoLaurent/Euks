import vine from '@vinejs/vine'

const localePattern = /^[a-z]{2}(?:-[A-Z]{2})?$/

export const createPayPalOrderValidator = vine.create({
  trackId: vine.number().withoutDecimals().positive(),
  licenseId: vine.number().withoutDecimals().positive(),
  locale: vine.string().trim().regex(localePattern).maxLength(10).optional(),
})

export const capturePayPalOrderValidator = vine.create({
  trackId: vine.number().withoutDecimals().positive().optional(),
  licenseId: vine.number().withoutDecimals().positive().optional(),
})
