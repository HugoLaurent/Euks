import MusicalKey from '#models/musical_key'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const MUSICAL_KEYS = [
  { name: 'C Major', slug: 'c-major' },
  { name: 'C Minor', slug: 'c-minor' },
  { name: 'C# Major', slug: 'c-sharp-major' },
  { name: 'C# Minor', slug: 'c-sharp-minor' },
  { name: 'D Major', slug: 'd-major' },
  { name: 'D Minor', slug: 'd-minor' },
  { name: 'Eb Major', slug: 'e-flat-major' },
  { name: 'Eb Minor', slug: 'e-flat-minor' },
  { name: 'E Major', slug: 'e-major' },
  { name: 'E Minor', slug: 'e-minor' },
  { name: 'F Major', slug: 'f-major' },
  { name: 'F Minor', slug: 'f-minor' },
  { name: 'F# Major', slug: 'f-sharp-major' },
  { name: 'F# Minor', slug: 'f-sharp-minor' },
  { name: 'G Major', slug: 'g-major' },
  { name: 'G Minor', slug: 'g-minor' },
  { name: 'Ab Major', slug: 'a-flat-major' },
  { name: 'Ab Minor', slug: 'a-flat-minor' },
  { name: 'A Major', slug: 'a-major' },
  { name: 'A Minor', slug: 'a-minor' },
  { name: 'Bb Major', slug: 'b-flat-major' },
  { name: 'Bb Minor', slug: 'b-flat-minor' },
  { name: 'B Major', slug: 'b-major' },
  { name: 'B Minor', slug: 'b-minor' },
] as const

export default class extends BaseSeeder {
  async run() {
    await MusicalKey.updateOrCreateMany(
      'slug',
      MUSICAL_KEYS.map((musicalKey) => ({
        name: musicalKey.name,
        slug: musicalKey.slug,
      }))
    )
  }
}
