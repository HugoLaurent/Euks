import License from '#models/license'
import Track from '#models/track'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    const [tracks, licenses] = await Promise.all([
      Track.all(),
      License.query().where('is_active', true),
    ])

    if (!tracks.length || !licenses.length) {
      return
    }

    for (const track of tracks) {
      const syncPayload = Object.fromEntries(
        licenses.map((license) => [
          license.id,
          {
            price_cents: license.priceCents,
            is_active: true,
          },
        ])
      )

      await track.related('licenses').sync(syncPayload)
    }
  }
}
