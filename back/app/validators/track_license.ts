import vine from '@vinejs/vine'

const trackLicenseSchema = vine.object({
  licenses: vine
    .array(
      vine.object({
        licenseId: vine.number().withoutDecimals().positive(),
        priceCents: vine.number().withoutDecimals().nonNegative(),
        isActive: vine.boolean().optional(),
      })
    )
    .distinct('licenseId'),
})

export const syncTrackLicensesValidator = vine.create(trackLicenseSchema)
