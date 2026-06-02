import License from '#models/license'
import Track from '#models/track'

export type CheckoutLicenseResolution =
  | { kind: 'track_not_found' }
  | { kind: 'license_invalid' }
  | { kind: 'license_unavailable'; license: License }
  | {
      kind: 'ok'
      track: Track
      license: License
      priceCents: number
    }

export type TrackLicenseInput = {
  licenseId: number
  isActive?: boolean
}

export async function resolveCheckoutLicense(
  trackId: number,
  licenseId: number
): Promise<CheckoutLicenseResolution> {
  const track = await Track.find(trackId)
  if (!track) {
    return { kind: 'track_not_found' }
  }

  const license = await License.find(licenseId)
  if (!license) {
    return { kind: 'license_invalid' }
  }

  const attachedLicense = await track
    .related('licenses')
    .query()
    .where('licenses.id', license.id)
    .first()

  if (!attachedLicense) {
    return { kind: 'license_unavailable', license }
  }

  const isTrackLicenseActive = Boolean(attachedLicense.$extras.pivot_is_active)
  const licensePriceCents = Number(license.priceCents)
  const pivotPriceCents = Number(attachedLicense.$extras.pivot_price_cents)
  const priceCents =
    Number.isFinite(licensePriceCents) && licensePriceCents >= 0
      ? licensePriceCents
      : pivotPriceCents

  if (!license.isActive || !isTrackLicenseActive) {
    return { kind: 'license_unavailable', license }
  }

  return {
    kind: 'ok',
    track,
    license,
    priceCents,
  }
}

export async function syncTrackLicenses(track: Track, licenses: TrackLicenseInput[]) {
  const licenseIds = [...new Set(licenses.map((entry) => entry.licenseId))]
  const existingLicenses = await License.query().whereIn('id', licenseIds)

  if (existingLicenses.length !== licenseIds.length) {
    const missingLicenseIds = licenseIds.filter(
      (licenseId) => !existingLicenses.some((license) => license.id === licenseId)
    )

    return {
      ok: false as const,
      missingLicenseIds,
    }
  }

  const syncPayload = Object.fromEntries(
    licenses.map((entry) => {
      const license = existingLicenses.find(
        (existingLicense) => existingLicense.id === entry.licenseId
      )!

      return [
        entry.licenseId,
        {
          price_cents: license.priceCents,
          is_active: entry.isActive ?? true,
        },
      ]
    })
  )

  await track.related('licenses').sync(syncPayload)

  return {
    ok: true as const,
  }
}
