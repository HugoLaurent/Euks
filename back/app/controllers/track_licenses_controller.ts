import Track from '#models/track'
import { syncTrackLicenses } from '#services/licensing_service'
import LicenseTransformer from '#transformers/license_transformer'
import { syncTrackLicensesValidator } from '#validators/track_license'
import type { HttpContext } from '@adonisjs/core/http'

export default class TrackLicensesController {
  async show({ params, serialize }: HttpContext) {
    const track = await Track.findOrFail(params.id)
    const licenses = await this.loadTrackLicenses(track)

    return serialize({
      track: {
        id: track.id,
        title: track.title,
      },
      licenses: LicenseTransformer.transform(licenses),
    })
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const track = await Track.findOrFail(params.id)
    const payload = await request.validateUsing(syncTrackLicensesValidator)
    const result = await syncTrackLicenses(track, payload.licenses)

    if (!result.ok) {
      return response.status(422).send({
        message: `Unknown license ids: ${result.missingLicenseIds.join(', ')}`,
        errors: [
          {
            field: 'licenses',
            message: `Unknown license ids: ${result.missingLicenseIds.join(', ')}`,
          },
        ],
      })
    }

    const licenses = await this.loadTrackLicenses(track)

    return serialize({
      track: {
        id: track.id,
        title: track.title,
      },
      licenses: LicenseTransformer.transform(licenses),
    })
  }

  private loadTrackLicenses(track: Track) {
    return track.related('licenses').query().orderBy('sort_order').orderBy('title')
  }
}
