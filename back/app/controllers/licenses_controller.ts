import License from '#models/license'
import LicenseTransformer from '#transformers/license_transformer'
import { createLicenseValidator, updateLicenseValidator } from '#validators/license'
import type { HttpContext } from '@adonisjs/core/http'
import type User from '#models/user'

export default class LicensesController {
  async index({ request, response, serialize, auth }: HttpContext) {
    const activeOnly = this.parseBoolean(request.input('activeOnly'), true)
    const paypalOnly = this.parseBoolean(request.input('paypalOnly'), false)
    const isTemplate = request.input('isTemplate')
    const templateCategory = request.input('templateCategory')
    const isExclusive = request.input('isExclusive')
    const parsedIsTemplate =
      isTemplate === undefined ? undefined : this.parseBoolean(isTemplate, false)
    const parsedIsExclusive =
      isExclusive === undefined ? undefined : this.parseBoolean(isExclusive, false)

    if (activeOnly === null) {
      return this.validationError(response, 'activeOnly', 'activeOnly must be a boolean')
    }

    if (paypalOnly === null) {
      return this.validationError(response, 'paypalOnly', 'paypalOnly must be a boolean')
    }

    if (parsedIsTemplate === null) {
      return this.validationError(response, 'isTemplate', 'isTemplate must be a boolean')
    }

    if (parsedIsExclusive === null) {
      return this.validationError(response, 'isExclusive', 'isExclusive must be a boolean')
    }

    const query = License.query().orderBy('sort_order').orderBy('title')

    // === FILTERS PAR UTILISATEUR ===
    // Afficher les templates publics + les licenses propres à cet utilisateur
    if (parsedIsTemplate === undefined && auth.isAuthenticated) {
      query.where((q) => {
        q.where('is_template', true).orWhere('user_id', auth.user!.id)
      })
    } else if (parsedIsTemplate === undefined) {
      query.where('is_template', true)
    }

    if (activeOnly) {
      query.where('is_active', true)
    }

    if (paypalOnly) {
      query.where('is_paypal_enabled', true)
    }

    if (parsedIsTemplate !== undefined) {
      query.where('is_template', parsedIsTemplate)
    }

    if (templateCategory) {
      query.where('template_category', templateCategory)
    }

    if (parsedIsExclusive !== undefined) {
      query.where('is_exclusive', parsedIsExclusive)
    }

    return serialize(LicenseTransformer.transform(await query))
  }

  async show({ params, serialize }: HttpContext) {
    const license = await License.findOrFail(params.id)
    return serialize(LicenseTransformer.transform(license))
  }

  async store({ request, response, serialize, auth }: HttpContext) {
    const payload = await request.validateUsing(createLicenseValidator)

    await auth.authenticate()

    const totalSplit =
      (payload.masterSplitPercentage ?? 0) +
      (payload.publishingSplitPercentage ?? 0) +
      (payload.thirdPartySplitPercentage ?? 0)

    if (totalSplit > 100) {
      return this.validationError(
        response,
        'splits',
        `Total splits percentage cannot exceed 100% (got ${totalSplit}%)`
      )
    }

    const priceCents = payload.priceCents ?? 0
    const isPaypalEnabled = payload.isPaypalEnabled ?? true

    if (isPaypalEnabled && priceCents <= 0) {
      return this.validationError(response, 'priceCents', 'Paid licenses must have a price')
    }

    const license = await License.create({
      title: payload.title,
      userId: auth.user!.id,
      description: payload.description ?? null,
      isPaypalEnabled: payload.isPaypalEnabled ?? true,
      isActive: payload.isActive ?? true,
      sortOrder: payload.sortOrder ?? 0,
      priceCents,

      audioFormats: payload.audioFormats ?? null,
      trackSeparation: payload.trackSeparation ?? null,

      maxStreams: payload.maxStreams ?? null,
      maxDownloads: payload.maxDownloads ?? null,
      maxSales: payload.maxSales ?? null,
      radioStations: payload.radioStations ?? null,

      allowVideoClips: payload.allowVideoClips ?? false,
      videoClipsLimit: payload.videoClipsLimit ?? null,
      allowedPlatforms: payload.allowedPlatforms ?? null,

      allowLivePerformance: payload.allowLivePerformance ?? false,
      allowRadioAirplay: payload.allowRadioAirplay ?? false,
      allowTelevision: payload.allowTelevision ?? false,
      allowStreaming: payload.allowStreaming ?? true,
      allowPodcast: payload.allowPodcast ?? false,
      allowMechanicalRepro: payload.allowMechanicalRepro ?? false,
      allowRemix: payload.allowRemix ?? false,
      allowRemixDistribution: payload.allowRemixDistribution ?? false,
      allowSampling: payload.allowSampling ?? false,
      allowMonetization: payload.allowMonetization ?? false,
      allowContentId: payload.allowContentId ?? false,

      isExclusive: payload.isExclusive ?? false,
      allowCommercialUse: payload.allowCommercialUse ?? false,
      commercialUseLimit: payload.commercialUseLimit ?? null,
      commercialUseDescription: payload.commercialUseDescription ?? null,

      allowedTerritories: payload.allowedTerritories ?? ['WORLDWIDE'],
      durationMonths: payload.durationMonths ?? null,
      licenseStartDate: payload.licenseStartDate ?? null,
      licenseEndDate: payload.licenseEndDate ?? null,

      allowTransfer: payload.allowTransfer ?? false,
      allowSublicense: payload.allowSublicense ?? false,
      transferRestrictions: payload.transferRestrictions ?? null,

      requireMasterCredit: payload.requireMasterCredit ?? true,
      requirePublishingCredit: payload.requirePublishingCredit ?? true,
      requireArtistCredit: payload.requireArtistCredit ?? true,
      creditRequirements: payload.creditRequirements ?? null,
      masterSplitPercentage: payload.masterSplitPercentage ?? 0,
      publishingSplitPercentage: payload.publishingSplitPercentage ?? 0,
      thirdPartySplitPercentage: payload.thirdPartySplitPercentage ?? 0,

      minAudioBitrate: payload.minAudioBitrate ?? null,
      requireDrmEncryption: payload.requireDrmEncryption ?? false,
      allowOfflineListening: payload.allowOfflineListening ?? false,
      maxConcurrentStreams: payload.maxConcurrentStreams ?? null,

      allowTrackModification: payload.allowTrackModification ?? false,
      requireApprovalForModification: payload.requireApprovalForModification ?? false,
      modificationRestrictions: payload.modificationRestrictions ?? null,

      allowNonprofitUse: payload.allowNonprofitUse ?? false,
      allowEducationalUse: payload.allowEducationalUse ?? false,
      allowReligiousUse: payload.allowReligiousUse ?? false,
      allowPoliticalUse: payload.allowPoliticalUse ?? false,
      allowAdultContent: payload.allowAdultContent ?? true,
      allowGamblingUse: payload.allowGamblingUse ?? false,
      allowMilitaryUse: payload.allowMilitaryUse ?? false,

      restrictedGenres: payload.restrictedGenres ?? null,
      restrictedUseCases: payload.restrictedUseCases ?? null,
      additionalTerms: payload.additionalTerms ?? null,
      requiresWrittenAgreement: payload.requiresWrittenAgreement ?? false,

      revisionDate: payload.revisionDate ?? null,
      revisionNotes: payload.revisionNotes ?? null,
      isTemplate: payload.isTemplate ?? false,
      templateCategory: payload.templateCategory ?? null,
    })

    response.status(201)
    return serialize(LicenseTransformer.transform(license))
  }

  async update({ params, request, response, serialize, auth }: HttpContext) {
    await auth.authenticate()

    const license = await License.findOrFail(params.id)

    if (!this.canManageLicense(auth.user!, license)) {
      return response.forbidden({ message: 'You can only update your own licenses' })
    }

    const payload = await request.validateUsing(updateLicenseValidator)

    if (
      payload.masterSplitPercentage !== undefined ||
      payload.publishingSplitPercentage !== undefined ||
      payload.thirdPartySplitPercentage !== undefined
    ) {
      const totalSplit =
        (payload.masterSplitPercentage ?? license.masterSplitPercentage) +
        (payload.publishingSplitPercentage ?? license.publishingSplitPercentage) +
        (payload.thirdPartySplitPercentage ?? license.thirdPartySplitPercentage)

      if (totalSplit > 100) {
        return this.validationError(
          response,
          'splits',
          `Total splits percentage cannot exceed 100% (got ${totalSplit}%)`
        )
      }
    }

    const nextPriceCents = payload.priceCents ?? license.priceCents
    const nextIsPaypalEnabled = payload.isPaypalEnabled ?? license.isPaypalEnabled

    if (nextIsPaypalEnabled && nextPriceCents <= 0) {
      return this.validationError(response, 'priceCents', 'Paid licenses must have a price')
    }

    license.merge(payload)
    await license.save()

    return serialize(LicenseTransformer.transform(license))
  }

  async destroy({ params, response, auth }: HttpContext) {
    await auth.authenticate()

    const license = await License.findOrFail(params.id)

    if (!this.canManageLicense(auth.user!, license)) {
      return response.forbidden({ message: 'You can only delete your own licenses' })
    }

    await license.delete()

    return {
      message: 'License deleted successfully',
    }
  }

  private parseBoolean(value: unknown, fallback: boolean) {
    if (value === undefined || value === null || value === '') {
      return fallback
    }

    if (typeof value === 'boolean') {
      return value
    }

    if (value === 'true' || value === '1') {
      return true
    }

    if (value === 'false' || value === '0') {
      return false
    }

    return null
  }

  private validationError(response: HttpContext['response'], field: string, message: string) {
    return response.status(422).send({
      message,
      errors: [{ field, message }],
    })
  }

  private canManageLicense(user: User, license: License) {
    if (user.role === 'owner') {
      return true
    }

    return license.userId === user.id
  }
}
