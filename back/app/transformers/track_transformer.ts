import type Track from '#models/track'
import { BaseTransformer } from '@adonisjs/core/transformers'
import LicenseTransformer from '#transformers/license_transformer'
import MusicalKeyTransformer from '#transformers/musical_key_transformer'
import TagTransformer from '#transformers/tag_transformer'

export default class TrackTransformer extends BaseTransformer<Track> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'title',
        'coverImagePath',
        'audioFilePath',
        'durationSeconds',
        'bpm',
        'musicalKeyId',
        'priceCents',
        'listenCount',
        'isActive',
        'isSold',
        'soldAt',
        'createdAt',
        'updatedAt',
      ]),
      licenses: LicenseTransformer.transform(this.whenLoaded(this.resource.licenses)),
      musicalKey: MusicalKeyTransformer.transform(this.whenLoaded(this.resource.musicalKey)),
      tags: TagTransformer.transform(this.whenLoaded(this.resource.tags)),
    }
  }
}
