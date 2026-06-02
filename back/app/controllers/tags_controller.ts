import Tag from '#models/tag'
import { slugify } from '#services/slug'
import TagTransformer from '#transformers/tag_transformer'
import { createTagValidator, tagTypes, updateTagValidator } from '#validators/tag'
import type { HttpContext } from '@adonisjs/core/http'

export default class TagsController {
  async index({ request, response, serialize }: HttpContext) {
    const type = request.input('type')

    if (type !== undefined && !tagTypes.includes(type)) {
      return this.validationError(response, 'type', 'Tag type must be mood or genre')
    }

    const query = Tag.query().orderBy('type').orderBy('name')

    if (type) {
      query.where('type', type)
    }

    return serialize(TagTransformer.transform(await query))
  }

  async show({ params, serialize }: HttpContext) {
    const tag = await Tag.findOrFail(params.id)
    return serialize(TagTransformer.transform(tag))
  }

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createTagValidator)
    const slug = this.resolveSlug(payload.slug, payload.name)

    if (!slug) {
      return this.validationError(response, 'slug', 'Unable to generate a valid slug for this tag')
    }

    const duplicate = await Tag.query().where('type', payload.type).where('slug', slug).first()

    if (duplicate) {
      return this.conflictError(
        response,
        'slug',
        `A ${payload.type} tag with slug "${slug}" already exists`
      )
    }

    const tag = await Tag.create({
      name: payload.name,
      slug,
      type: payload.type,
    })

    response.status(201)
    return serialize(TagTransformer.transform(tag))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const tag = await Tag.findOrFail(params.id)
    const payload = await request.validateUsing(updateTagValidator)

    const nextType = payload.type ?? tag.type
    const nextSlug =
      payload.slug !== undefined ? this.resolveSlug(payload.slug, tag.name) : tag.slug

    if (!nextSlug) {
      return this.validationError(response, 'slug', 'Unable to generate a valid slug for this tag')
    }

    const duplicate = await Tag.query()
      .where('type', nextType)
      .where('slug', nextSlug)
      .whereNot('id', tag.id)
      .first()

    if (duplicate) {
      return this.conflictError(
        response,
        'slug',
        `A ${nextType} tag with slug "${nextSlug}" already exists`
      )
    }

    tag.merge({
      name: payload.name ?? tag.name,
      slug: nextSlug,
      type: nextType,
    })

    await tag.save()

    return serialize(TagTransformer.transform(tag))
  }

  async destroy({ params }: HttpContext) {
    const tag = await Tag.findOrFail(params.id)
    await tag.delete()

    return {
      message: 'Tag deleted successfully',
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
