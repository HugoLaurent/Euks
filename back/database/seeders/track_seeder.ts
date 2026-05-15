import MusicalKey from '#models/musical_key'
import Tag from '#models/tag'
import Track from '#models/track'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { faker } from '@faker-js/faker'

const TRACKS_COUNT = 36

export default class extends BaseSeeder {
  static environment = ['development', 'test']

  async run() {
    faker.seed(20260416)

    const [musicalKeys, moodTags, genreTags] = await Promise.all([
      MusicalKey.all(),
      Tag.query().where('type', 'mood'),
      Tag.query().where('type', 'genre'),
    ])

    if (!musicalKeys.length || !moodTags.length || !genreTags.length) {
      throw new Error('Run musical_key_seeder and tag_seeder before track_seeder')
    }

    for (let index = 1; index <= TRACKS_COUNT; index++) {
      const trackCode = `track-${String(index).padStart(3, '0')}`
      const audioFilePath = `seed/audio/${trackCode}.mp3`
      const musicalKey = faker.helpers.arrayElement(musicalKeys)
      const selectedMoodTags = faker.helpers.arrayElements(moodTags, {
        min: 1,
        max: 3,
      })
      const selectedGenreTags = faker.helpers.arrayElements(genreTags, {
        min: 1,
        max: 2,
      })
      const payload = {
        title: `${faker.music.songName()} ${faker.helpers.arrayElement(['Edit', 'Mix', 'Version'])}`,
        coverImagePath: `seed/covers/${trackCode}.jpg`,
        audioFilePath,
        durationSeconds: faker.number.int({ min: 95, max: 260 }),
        bpm: faker.number.int({ min: 72, max: 168 }),
        musicalKeyId: musicalKey.id,
        priceCents: faker.helpers.arrayElement([999, 1499, 1999, 2499, 2999]),
        listenCount: faker.number.int({ min: 0, max: 50000 }),
      }

      const existingTrack = await Track.findBy('audioFilePath', audioFilePath)
      const track = existingTrack ? existingTrack.merge(payload) : await Track.create(payload)

      if (existingTrack) {
        await track.save()
      }

      const tagIds = [...new Set([...selectedMoodTags, ...selectedGenreTags].map((tag) => tag.id))]
      await track.related('tags').sync(tagIds)
    }
  }
}
