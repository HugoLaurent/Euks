import type License from '#models/license'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class LicenseTransformer extends BaseTransformer<License> {
  toObject() {
    return {
      // === BASICS ===
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      isPaypalEnabled: this.resource.isPaypalEnabled,
      isActive: this.resource.isActive,
      sortOrder: this.resource.sortOrder,

      // === AUDIO ===
      audioFormats: this.resource.audioFormats,
      trackSeparation: this.resource.trackSeparation,

      // === DISTRIBUTION LIMITS ===
      maxStreams: this.resource.maxStreams,
      maxDownloads: this.resource.maxDownloads,
      maxSales: this.resource.maxSales,

      // === VIDEO ===
      allowVideoClips: this.resource.allowVideoClips,
      videoClipsLimit: this.resource.videoClipsLimit,
      allowedPlatforms: this.resource.allowedPlatforms,

      // === USAGE RIGHTS ===
      allowLivePerformance: this.resource.allowLivePerformance,
      allowRadioAirplay: this.resource.allowRadioAirplay,
      allowTelevision: this.resource.allowTelevision,
      allowStreaming: this.resource.allowStreaming,
      allowPodcast: this.resource.allowPodcast,
      allowMechanicalRepro: this.resource.allowMechanicalRepro,
      allowRemix: this.resource.allowRemix,
      allowRemixDistribution: this.resource.allowRemixDistribution,
      allowSampling: this.resource.allowSampling,
      allowMonetization: this.resource.allowMonetization,
      allowContentId: this.resource.allowContentId,

      // === COMMERCIALITY ===
      isExclusive: this.resource.isExclusive,
      allowCommercialUse: this.resource.allowCommercialUse,
      commercialUseLimit: this.resource.commercialUseLimit,
      commercialUseDescription: this.resource.commercialUseDescription,

      // === TERRITORIAL & DURATION ===
      allowedTerritories: this.resource.allowedTerritories,
      durationMonths: this.resource.durationMonths,
      licenseStartDate: this.resource.licenseStartDate,
      licenseEndDate: this.resource.licenseEndDate,

      // === TRANSFER & SUBLICENSE ===
      allowTransfer: this.resource.allowTransfer,
      allowSublicense: this.resource.allowSublicense,
      transferRestrictions: this.resource.transferRestrictions,

      // === ATTRIBUTION & SPLITS ===
      requireMasterCredit: this.resource.requireMasterCredit,
      requirePublishingCredit: this.resource.requirePublishingCredit,
      requireArtistCredit: this.resource.requireArtistCredit,
      creditRequirements: this.resource.creditRequirements,
      masterSplitPercentage: this.resource.masterSplitPercentage,
      publishingSplitPercentage: this.resource.publishingSplitPercentage,
      thirdPartySplitPercentage: this.resource.thirdPartySplitPercentage,

      // === TECHNICAL ===
      minAudioBitrate: this.resource.minAudioBitrate,
      requireDrmEncryption: this.resource.requireDrmEncryption,
      allowOfflineListening: this.resource.allowOfflineListening,
      maxConcurrentStreams: this.resource.maxConcurrentStreams,

      // === MODIFICATIONS ===
      allowTrackModification: this.resource.allowTrackModification,
      requireApprovalForModification: this.resource.requireApprovalForModification,
      modificationRestrictions: this.resource.modificationRestrictions,

      // === RESTRICTED USES ===
      allowNonprofitUse: this.resource.allowNonprofitUse,
      allowEducationalUse: this.resource.allowEducationalUse,
      allowReligiousUse: this.resource.allowReligiousUse,
      allowPoliticalUse: this.resource.allowPoliticalUse,
      allowAdultContent: this.resource.allowAdultContent,
      allowGamblingUse: this.resource.allowGamblingUse,
      allowMilitaryUse: this.resource.allowMilitaryUse,

      // === RESTRICTIONS ===
      restrictedGenres: this.resource.restrictedGenres,
      restrictedUseCases: this.resource.restrictedUseCases,
      additionalTerms: this.resource.additionalTerms,
      requiresWrittenAgreement: this.resource.requiresWrittenAgreement,

      // === VERSIONING ===
      revisionDate: this.resource.revisionDate,
      revisionNotes: this.resource.revisionNotes,
      isTemplate: this.resource.isTemplate,
      templateCategory: this.resource.templateCategory,

      // === TIMESTAMPS ===
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,

      // === PIVOT DATA (when used as track license) ===
      priceCents: this.when(this.hasPivotValue('pivot_price_cents'), () =>
        Number(this.resource.$extras.pivot_price_cents)
      ),
      isTrackActive: this.when(this.hasPivotValue('pivot_is_active'), () =>
        Boolean(this.resource.$extras.pivot_is_active)
      ),
    }
  }

  private hasPivotValue(key: string) {
    return Object.prototype.hasOwnProperty.call(this.resource.$extras, key)
  }
}
