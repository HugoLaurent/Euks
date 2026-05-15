import MusicalKey from '#models/musical_key'
import { slugify } from '#services/slug'
import MusicalKeyTransformer from '#transformers/musical_key_transformer'
import { createMusicalKeyValidator, updateMusicalKeyValidator } from '#validators/musical_key'
import type { HttpContext } from '@adonisjs/core/http'

export default class MusicalKeysController {
  async index({ serialize }: HttpContext) {
    const musicalKeys = await MusicalKey.query().orderBy('name')
    return serialize(MusicalKeyTransformer.transform(musicalKeys))
  }

  async show({ params, serialize }: HttpContext) {
    const musicalKey = await MusicalKey.findOrFail(params.id)
    return serialize(MusicalKeyTransformer.transform(musicalKey))
  }

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createMusicalKeyValidator)
    const slug = this.resolveSlug(payload.slug, payload.name)

    if (!slug) {
      return this.validationError(
        response,
        'slug',
        'Unable to generate a valid slug for this musical key'
      )
    }

    const duplicateByName = await MusicalKey.query().where('name', payload.name).first()
    if (duplicateByName) {
      return this.conflictError(
        response,
        'name',
        `A musical key named "${payload.name}" already exists`
      )
    }

    const duplicateBySlug = await MusicalKey.query().where('slug', slug).first()
    if (duplicateBySlug) {
      return this.conflictError(
        response,
        'slug',
        `A musical key with slug "${slug}" already exists`
      )
    }

    const musicalKey = await MusicalKey.create({
      name: payload.name,
      slug,
    })

    return response.status(201).send(serialize(MusicalKeyTransformer.transform(musicalKey)))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const musicalKey = await MusicalKey.findOrFail(params.id)
    const payload = await request.validateUsing(updateMusicalKeyValidator)

    const nextName = payload.name ?? musicalKey.name
    const nextSlug =
      payload.slug !== undefined ? this.resolveSlug(payload.slug, nextName) : musicalKey.slug

    if (!nextSlug) {
      return this.validationError(
        response,
        'slug',
        'Unable to generate a valid slug for this musical key'
      )
    }

    const duplicateByName = await MusicalKey.query()
      .where('name', nextName)
      .whereNot('id', musicalKey.id)
      .first()

    if (duplicateByName) {
      return this.conflictError(
        response,
        'name',
        `A musical key named "${nextName}" already exists`
      )
    }

    const duplicateBySlug = await MusicalKey.query()
      .where('slug', nextSlug)
      .whereNot('id', musicalKey.id)
      .first()

    if (duplicateBySlug) {
      return this.conflictError(
        response,
        'slug',
        `A musical key with slug "${nextSlug}" already exists`
      )
    }

    musicalKey.merge({
      name: nextName,
      slug: nextSlug,
    })

    await musicalKey.save()

    return serialize(MusicalKeyTransformer.transform(musicalKey))
  }

  async destroy({ params }: HttpContext) {
    const musicalKey = await MusicalKey.findOrFail(params.id)
    await musicalKey.delete()

    return {
      message: 'Musical key deleted successfully',
    }
  }

  private resolveSlug(proposedSlug: string | undefined, fallback: string) {
    return slugify(proposedSlug ?? fallback)
  }

  private validationError(response: HttpContext['response'], field: string, message: string) {
    return response.status(422).send({
      message,
      errors: [{ field, message }],
    })
  }

  private conflictError(response: HttpContext['response'], field: string, message: string) {
    return response.status(409).send({
      message,
      errors: [{ field, message }],
    })
  }
}
