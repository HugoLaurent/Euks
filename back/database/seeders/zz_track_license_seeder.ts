import License from '#models/license'
import Track from '#models/track'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

function toRoundedPrice(value: number) {
  return Math.max(500, Math.round(value / 100) * 100)
}

function createPricing(basePriceCents: number) {
  return {
    'Basic License': toRoundedPrice(basePriceCents),
    'Premium License': toRoundedPrice(basePriceCents * 1.75),
    'Premium Plus License': toRoundedPrice(basePriceCents * 2.5),
    'Unlimited License': toRoundedPrice(basePriceCents * 4),
    'Exclusive Rights': toRoundedPrice(basePriceCents * 10),
  }
}

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

    const licensesByTitle = Object.fromEntries(licenses.map((license) => [license.title, license]))

    for (const track of tracks) {
      const pricing = createPricing(track.priceCents)
      const syncPayload = Object.fromEntries(
        Object.entries(pricing)
          .map(([licenseTitle, priceCents]) => {
            const license = licensesByTitle[licenseTitle]

            if (!license) {
              return null
            }

            return [
              license.id,
              {
                price_cents: priceCents,
                is_active: true,
              },
            ]
          })
          .filter(
            (entry): entry is [number, { price_cents: number; is_active: boolean }] =>
              entry !== null
          )
      )

      await track.related('licenses').sync(syncPayload)
    }
  }
}
