import Tag, { type TagType } from '#models/tag'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { toSlug } from '#database/seed_helpers'

const TAGS: Record<TagType, string[]> = {
  mood: [
    'Happy',
    'Sad',
    'Dark',
    'Energetic',
    'Chill',
    'Romantic',
    'Melancholic',
    'Dreamy',
    'Aggressive',
    'Epic',
    'Warm',
    'Nostalgic',
  ],
  genre: [
    'Afro',
    'Ambient',
    'Boom Bap',
    'Drill',
    'Electronic',
    'Hip Hop',
    'House',
    'Lo-Fi',
    'Pop',
    'R&B',
    'Trap',
    'UK Garage',
  ],
}

export default class extends BaseSeeder {
  async run() {
    const payload = (Object.entries(TAGS) as [TagType, string[]][]).flatMap(([type, names]) =>
      names.map((name) => ({
        name,
        slug: toSlug(name),
        type,
      }))
    )

    await Tag.updateOrCreateMany(['type', 'slug'], payload)
  }
}
