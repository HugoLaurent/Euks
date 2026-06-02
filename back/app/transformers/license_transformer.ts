import type License from '#models/license'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class LicenseTransformer extends BaseTransformer<License> {
  toObject() {
    return {
      id: this.resource.id,
      title: this.resource.title,
      description: this.resource.description,
      isPaypalEnabled: this.resource.isPaypalEnabled,
      isActive: this.resource.isActive,
      sortOrder: this.resource.sortOrder,
      priceCents: this.resource.priceCents,
      audioFormats: this.resource.audioFormats,
      trackSeparation: this.resource.trackSeparation,
      maxStreams: this.resource.maxStreams,
      maxSales: this.resource.maxSales,
      radioStations: this.resource.radioStations,
      allowVideoClips: this.resource.allowVideoClips,
      videoClipsLimit: this.resource.videoClipsLimit,
      allowLivePerformance: this.resource.allowLivePerformance,
      allowRadioAirplay: this.resource.allowRadioAirplay,
      allowTelevision: this.resource.allowTelevision,
      allowRemix: this.resource.allowRemix,
      allowMonetization: this.resource.allowMonetization,
      allowContentId: this.resource.allowContentId,
      additionalTerms: this.resource.additionalTerms,
      isTemplate: this.resource.isTemplate,
      templateCategory: this.resource.templateCategory,
      createdAt: this.resource.createdAt,
      updatedAt: this.resource.updatedAt,
      trackPriceCents: this.when(this.hasPivotValue('pivot_price_cents'), () =>
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
