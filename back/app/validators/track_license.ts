import vine from '@vinejs/vine'

const trackLicenseSchema = vine.object({
  licenses: vine
    .array(
      vine.object({
        licenseId: vine.number().withoutDecimals().positive(),
        isActive: vine.boolean().optional(),
      })
    )
    .distinct('licenseId'),
})

export const syncTrackLicensesValidator = vine.create(trackLicenseSchema)
