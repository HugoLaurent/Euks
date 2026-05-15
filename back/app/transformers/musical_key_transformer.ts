import type MusicalKey from '#models/musical_key'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class MusicalKeyTransformer extends BaseTransformer<MusicalKey> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'slug', 'createdAt', 'updatedAt'])
  }
}
