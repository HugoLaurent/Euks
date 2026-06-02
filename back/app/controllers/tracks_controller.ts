import MusicalKey from '#models/musical_key'
import Tag from '#models/tag'
import Track from '#models/track'
import TrackTransformer from '#transformers/track_transformer'
import { tagTypes } from '#validators/tag'
import { createTrackValidator, updateTrackValidator } from '#validators/track'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import { randomUUID } from 'node:crypto'
import { mkdir } from 'node:fs/promises'

type TrackMutationPayload = {
  title?: string
  coverImagePath?: string | null
  audioFilePath?: string | null
  waveFilePath?: string | null
  zipFilePath?: string | null
  durationSeconds?: number | null
  bpm?: number | null
  musicalKeyId?: number | null
  priceCents?: number
  listenCount?: number
  tagIds?: number[]
}

export default class TracksController {
  async index({ request, response, serialize }: HttpContext) {
    const page = this.parsePositiveInteger(request.input('page'), 1)
    const perPage = this.parsePositiveInteger(request.input('perPage'), 12)
    const musicalKeyId = this.parseNullablePositiveInteger(request.input('musicalKeyId'))
    const tagId = this.parseNullablePositiveInteger(request.input('tagId'))
    const tagType = request.input('tagType')
    const tagSlug = request.input('tagSlug')
    const search = request.input('search')

    if (page === null) {
      return this.validationError(response, 'page', 'Page must be a positive integer')
    }

    if (perPage === null) {
      return this.validationError(response, 'perPage', 'Per page must be a positive integer')
    }

    if (musicalKeyId === null) {
      return this.validationError(
        response,
        'musicalKeyId',
        'Musical key id must be a positive integer'
      )
    }

    if (tagId === null) {
      return this.validationError(response, 'tagId', 'Tag id must be a positive integer')
    }

    if (tagType !== undefined && !tagTypes.includes(tagType)) {
      return this.validationError(response, 'tagType', 'Tag type must be mood or genre')
    }

    if (tagSlug !== undefined && typeof tagSlug !== 'string') {
      return this.validationError(response, 'tagSlug', 'Tag slug must be a string')
    }

    if (search !== undefined && typeof search !== 'string') {
      return this.validationError(response, 'search', 'Search must be a string')
    }

    const query = this.baseQuery().orderBy('created_at', 'desc')

    if (search?.trim()) {
      query.whereRaw('LOWER(title) LIKE ?', [`%${search.trim().toLowerCase()}%`])
    }

    if (musicalKeyId) {
      query.where('musical_key_id', musicalKeyId)
    }

    if (tagId || tagSlug || tagType) {
      query.whereHas('tags', (tagsQuery) => {
        if (tagId) {
          tagsQuery.where('id', tagId)
        }

        if (tagSlug) {
          tagsQuery.where('slug', tagSlug)
        }

        if (tagType) {
          tagsQuery.where('type', tagType)
        }
      })
    }

    const tracks = await query.paginate(page, Math.min(perPage, 100))

    return serialize(TrackTransformer.paginate(tracks.all(), tracks.getMeta()))
  }

  async show({ params, serialize }: HttpContext) {
    const track = await this.baseQuery().where('id', params.id).firstOrFail()
    return serialize(TrackTransformer.transform(track))
  }

  async store({ request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(createTrackValidator)

    const referenceError = await this.ensureReferences(payload, response)
    if (referenceError) {
      return referenceError
    }

    const coverImagePath = await this.resolveUploadedMediaPath({
      file: this.getFirstFile(request, ['coverImage', 'cover']),
      fallbackPath: payload.coverImagePath,
      folder: 'covers',
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
      field: 'coverImagePath',
      label: 'cover image',
    })

    if ('error' in coverImagePath) {
      return this.validationError(
        response,
        coverImagePath.error.field,
        coverImagePath.error.message
      )
    }

    const audioFilePath = await this.resolveUploadedMediaPath({
      file: this.getFirstFile(request, ['previewAudio', 'previewMp3']),
      fallbackPath: payload.audioFilePath,
      folder: 'audio',
      allowedExtensions: ['mp3'],
      field: 'audioFilePath',
      label: 'preview audio',
    })

    if ('error' in audioFilePath) {
      return this.validationError(response, audioFilePath.error.field, audioFilePath.error.message)
    }

    const waveFilePath = await this.resolveUploadedMediaPath({
      file: this.getFirstFile(request, ['waveFile', 'previewWav']),
      fallbackPath: payload.waveFilePath,
      folder: 'audio',
      allowedExtensions: ['wav'],
      field: 'waveFilePath',
      label: 'wave file',
    })

    if ('error' in waveFilePath) {
      return this.validationError(response, waveFilePath.error.field, waveFilePath.error.message)
    }

    const zipFilePath = await this.resolveUploadedMediaPath({
      file: this.getFirstFile(request, ['zipFile', 'stemsZip']),
      fallbackPath: payload.zipFilePath,
      folder: 'archives',
      allowedExtensions: ['zip'],
      field: 'zipFilePath',
      label: 'zip file',
    })

    if ('error' in zipFilePath) {
      return this.validationError(response, zipFilePath.error.field, zipFilePath.error.message)
    }

    if (!coverImagePath.path) {
      return this.validationError(response, 'coverImagePath', 'Cover image is required')
    }

    if (!audioFilePath.path) {
      return this.validationError(response, 'audioFilePath', 'Preview audio is required')
    }

    if (!waveFilePath.path) {
      return this.validationError(response, 'waveFilePath', 'Wave file is required')
    }

    if (!zipFilePath.path) {
      return this.validationError(response, 'zipFilePath', 'Zip file is required')
    }

    const track = await Track.create({
      title: payload.title,
      coverImagePath: coverImagePath.path,
      audioFilePath: audioFilePath.path,
      waveFilePath: waveFilePath.path,
      zipFilePath: zipFilePath.path,
      durationSeconds: payload.durationSeconds ?? null,
      bpm: payload.bpm ?? null,
      musicalKeyId: payload.musicalKeyId ?? null,
      priceCents: payload.priceCents,
      listenCount: payload.listenCount ?? 0,
    })

    if (payload.tagIds) {
      await track.related('tags').sync(payload.tagIds)
    }

    await this.loadRelations(track)

    response.status(201)
    return serialize(TrackTransformer.transform(track))
  }

  async update({ params, request, response, serialize }: HttpContext) {
    const track = await Track.findOrFail(params.id)
    const payload = await request.validateUsing(updateTrackValidator)

    const referenceError = await this.ensureReferences(payload, response)
    if (referenceError) {
      return referenceError
    }

    if (
      payload.coverImagePath !== undefined ||
      this.getFirstFile(request, ['coverImage', 'cover'])
    ) {
      const coverImagePath = await this.resolveUploadedMediaPath({
        file: this.getFirstFile(request, ['coverImage', 'cover']),
        fallbackPath: payload.coverImagePath,
        folder: 'covers',
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        field: 'coverImagePath',
        label: 'cover image',
      })

      if ('error' in coverImagePath) {
        return this.validationError(
          response,
          coverImagePath.error.field,
          coverImagePath.error.message
        )
      }

      track.coverImagePath = coverImagePath.path
    }

    if (
      payload.audioFilePath !== undefined ||
      this.getFirstFile(request, ['previewAudio', 'previewMp3'])
    ) {
      const audioFilePath = await this.resolveUploadedMediaPath({
        file: this.getFirstFile(request, ['previewAudio', 'previewMp3']),
        fallbackPath: payload.audioFilePath,
        folder: 'audio',
        allowedExtensions: ['mp3'],
        field: 'audioFilePath',
        label: 'preview audio',
      })

      if ('error' in audioFilePath) {
        return this.validationError(
          response,
          audioFilePath.error.field,
          audioFilePath.error.message
        )
      }

      track.audioFilePath = audioFilePath.path
    }

    if (
      payload.waveFilePath !== undefined ||
      this.getFirstFile(request, ['waveFile', 'previewWav'])
    ) {
      const waveFilePath = await this.resolveUploadedMediaPath({
        file: this.getFirstFile(request, ['waveFile', 'previewWav']),
        fallbackPath: payload.waveFilePath,
        folder: 'audio',
        allowedExtensions: ['wav'],
        field: 'waveFilePath',
        label: 'wave file',
      })

      if ('error' in waveFilePath) {
        return this.validationError(response, waveFilePath.error.field, waveFilePath.error.message)
      }

      track.waveFilePath = waveFilePath.path
    }

    if (payload.zipFilePath !== undefined || this.getFirstFile(request, ['zipFile', 'stemsZip'])) {
      const zipFilePath = await this.resolveUploadedMediaPath({
        file: this.getFirstFile(request, ['zipFile', 'stemsZip']),
        fallbackPath: payload.zipFilePath,
        folder: 'archives',
        allowedExtensions: ['zip'],
        field: 'zipFilePath',
        label: 'zip file',
      })

      if ('error' in zipFilePath) {
        return this.validationError(response, zipFilePath.error.field, zipFilePath.error.message)
      }

      track.zipFilePath = zipFilePath.path
    }

    track.merge({
      ...(payload.title !== undefined ? { title: payload.title } : {}),
      ...(payload.coverImagePath !== undefined ? { coverImagePath: payload.coverImagePath } : {}),
      ...(payload.audioFilePath !== undefined ? { audioFilePath: payload.audioFilePath } : {}),
      ...(payload.waveFilePath !== undefined ? { waveFilePath: payload.waveFilePath } : {}),
      ...(payload.zipFilePath !== undefined ? { zipFilePath: payload.zipFilePath } : {}),
      ...(payload.durationSeconds !== undefined
        ? { durationSeconds: payload.durationSeconds }
        : {}),
      ...(payload.bpm !== undefined ? { bpm: payload.bpm } : {}),
      ...(payload.musicalKeyId !== undefined ? { musicalKeyId: payload.musicalKeyId } : {}),
      ...(payload.priceCents !== undefined ? { priceCents: payload.priceCents } : {}),
      ...(payload.listenCount !== undefined ? { listenCount: payload.listenCount } : {}),
    })

    await track.save()

    if (payload.tagIds !== undefined) {
      await track.related('tags').sync(payload.tagIds)
    }

    await this.loadRelations(track)

    return serialize(TrackTransformer.transform(track))
  }

  async destroy({ params }: HttpContext) {
    const track = await Track.findOrFail(params.id)
    await track.delete()

    return {
      message: 'Track deleted successfully',
    }
  }

  private baseQuery() {
    return Track.query()
      .preload('licenses', (query) => {
        query
          .where('licenses.is_active', true)
          .wherePivot('is_active', true)
          .orderBy('sort_order')
          .orderBy('title')
      })
      .preload('musicalKey')
      .preload('tags', (query) => query.orderBy('type').orderBy('name'))
  }

  private async loadRelations(track: Track) {
    await track.load('licenses', (query) => {
      query
        .where('licenses.is_active', true)
        .wherePivot('is_active', true)
        .orderBy('sort_order')
        .orderBy('title')
    })
    await track.load('musicalKey')
    await track.load('tags', (query) => query.orderBy('type').orderBy('name'))
  }

  private async ensureReferences(payload: TrackMutationPayload, response: HttpContext['response']) {
    if (payload.musicalKeyId) {
      const musicalKey = await MusicalKey.find(payload.musicalKeyId)

      if (!musicalKey) {
        return this.validationError(
          response,
          'musicalKeyId',
          `Musical key ${payload.musicalKeyId} does not exist`
        )
      }
    }

    if (payload.tagIds) {
      const uniqueTagIds = Array.from(new Set(payload.tagIds))
      const tags = await Tag.query().whereIn('id', uniqueTagIds)

      if (tags.length !== uniqueTagIds.length) {
        const missingTagIds = uniqueTagIds.filter((tagId) => !tags.some((tag) => tag.id === tagId))

        return this.validationError(
          response,
          'tagIds',
          `Unknown tag ids: ${missingTagIds.join(', ')}`
        )
      }

      payload.tagIds = uniqueTagIds
    }

    return null
  }

  private parsePositiveInteger(value: unknown, fallback: number) {
    if (value === undefined || value === null || value === '') {
      return fallback
    }

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null
    }

    return parsed
  }

  private parseNullablePositiveInteger(value: unknown) {
    if (value === undefined || value === null || value === '') {
      return undefined
    }

    const parsed = Number(value)
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null
    }

    return parsed
  }

  private validationError(response: HttpContext['response'], field: string, message: string) {
    // Return the response object (truthy) so callers like ensureReferences can
    // short-circuit on it — response.send() itself returns void.
    response.status(422).send({
      message,
      errors: [{ field, message }],
    })
    return response
  }

  private getFirstFile(request: HttpContext['request'], fieldNames: string[]) {
    for (const fieldName of fieldNames) {
      const file = request.file(fieldName)
      if (file) {
        return file
      }
    }

    return undefined
  }

  private async resolveUploadedMediaPath(options: {
    file: MultipartFile | undefined
    fallbackPath: string | null | undefined
    folder: string
    allowedExtensions: string[]
    field: string
    label: string
  }): Promise<{ path: string | null } | { error: { field: string; message: string } }> {
    const uploadedFile = options.file

    if (uploadedFile) {
      if (!uploadedFile.isValid) {
        const message = uploadedFile.errors[0]?.message ?? `Invalid ${options.label}`
        return {
          error: {
            field: options.field,
            message,
          },
        }
      }

      const extension = uploadedFile.extname?.toLowerCase()
      if (!extension || !options.allowedExtensions.includes(extension)) {
        return {
          error: {
            field: options.field,
            message: `Invalid ${options.label} format`,
          },
        }
      }

      const destinationFolder = app.publicPath(options.folder)
      await mkdir(destinationFolder, { recursive: true })

      const fileName = `${options.field}-${randomUUID()}.${extension}`
      await uploadedFile.move(destinationFolder, {
        name: fileName,
        overwrite: true,
      })

      return {
        path: `/${options.folder}/${fileName}`,
      }
    }

    return {
      path: options.fallbackPath ?? null,
    }
  }
}
