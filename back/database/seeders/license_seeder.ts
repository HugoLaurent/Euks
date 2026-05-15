import { BaseSeeder } from '@adonisjs/lucid/seeders'
import License from '#models/license'

export default class extends BaseSeeder {
  async run() {
    // Effacer les licenses existantes
    await License.query().delete()

    // === TEMPLATE BASIC - Entry-level ===
    await License.create({
      title: 'Basic License',
      description: 'Entry-level license for demos, social media & light commercial use.',
      isPaypalEnabled: true,
      isActive: true,
      sortOrder: 10,
      isTemplate: true,
      templateCategory: 'standard',

      audioFormats: ['mp3'],
      trackSeparation: 'full_mix',

      maxStreams: 100000,
      maxDownloads: 1000,
      maxSales: null,

      allowVideoClips: true,
      videoClipsLimit: 1,
      allowedPlatforms: ['tiktok', 'instagram', 'youtube'],

      allowLivePerformance: false,
      allowRadioAirplay: false,
      allowTelevision: false,
      allowStreaming: true,
      allowPodcast: false,
      allowMechanicalRepro: false,
      allowRemix: false,
      allowRemixDistribution: false,
      allowSampling: false,
      allowMonetization: false,
      allowContentId: false,

      isExclusive: false,
      allowCommercialUse: true,
      commercialUseLimit: 'limited',
      commercialUseDescription: 'For personal & small business use only. Revenue cap: $50k/year.',

      allowedTerritories: ['WORLDWIDE'],
      durationMonths: null,

      allowTransfer: false,
      allowSublicense: false,

      requireMasterCredit: true,
      requirePublishingCredit: true,
      requireArtistCredit: true,
      creditRequirements: '[Artist] - [Track] (euks.io)',

      masterSplitPercentage: 0,
      publishingSplitPercentage: 0,
      thirdPartySplitPercentage: 0,

      minAudioBitrate: '128',
      requireDrmEncryption: false,
      allowOfflineListening: false,

      allowNonprofitUse: true,
      allowEducationalUse: true,
      allowReligiousUse: true,
      allowPoliticalUse: false,
      allowAdultContent: true,
      allowGamblingUse: false,
      allowMilitaryUse: false,

      additionalTerms: 'Suitable for TikTok, Instagram, YouTube Shorts. Cannot monetize via YouTube Partner Program.',
    })

    // === TEMPLATE PROFESSIONAL - Standard commercial ===
    await License.create({
      title: 'Premium License',
      description: 'Extended commercial license with broader usage scope including monetization.',
      isPaypalEnabled: true,
      isActive: true,
      sortOrder: 20,
      isTemplate: true,
      templateCategory: 'standard',

      audioFormats: ['mp3', 'wav'],
      trackSeparation: 'full_mix',

      maxStreams: null,
      maxDownloads: null,
      maxSales: null,

      allowVideoClips: true,
      videoClipsLimit: null,
      allowedPlatforms: ['tiktok', 'youtube', 'instagram', 'twitch', 'facebook'],

      allowLivePerformance: false,
      allowRadioAirplay: false,
      allowTelevision: false,
      allowStreaming: true,
      allowPodcast: true,
      allowMechanicalRepro: false,
      allowRemix: false,
      allowRemixDistribution: false,
      allowSampling: false,
      allowMonetization: true,
      allowContentId: true,

      isExclusive: false,
      allowCommercialUse: true,
      commercialUseLimit: 'unlimited',

      allowedTerritories: ['WORLDWIDE'],
      durationMonths: null,

      allowTransfer: false,
      allowSublicense: false,

      requireMasterCredit: true,
      requirePublishingCredit: true,
      requireArtistCredit: true,
      creditRequirements: '[Artist] - [Track] (euks.io)',

      masterSplitPercentage: 70,
      publishingSplitPercentage: 15,
      thirdPartySplitPercentage: 15,

      minAudioBitrate: '192',
      requireDrmEncryption: false,
      allowOfflineListening: false,
      maxConcurrentStreams: null,

      allowTrackModification: false,
      allowNonprofitUse: true,
      allowEducationalUse: true,
      allowReligiousUse: true,
      allowPoliticalUse: false,
      allowAdultContent: true,
      allowGamblingUse: false,
      allowMilitaryUse: false,

      additionalTerms: 'Full monetization rights. YouTube Content ID eligible. Suitable for all digital platforms.',
    })

    // === TEMPLATE PREMIUM PLUS - Advanced rights ===
    await License.create({
      title: 'Premium Plus License',
      description: 'High-tier license with extended rights including remixes, live performances & exclusivity options.',
      isPaypalEnabled: true,
      isActive: true,
      sortOrder: 30,
      isTemplate: true,
      templateCategory: 'premium',

      audioFormats: ['mp3', 'wav', 'flac', 'aiff'],
      trackSeparation: 'stems',

      maxStreams: null,
      maxDownloads: null,
      maxSales: null,

      allowVideoClips: true,
      videoClipsLimit: null,
      allowedPlatforms: ['tiktok', 'youtube', 'instagram', 'twitch', 'facebook', 'snapchat'],

      allowLivePerformance: true,
      allowRadioAirplay: true,
      allowTelevision: false,
      allowStreaming: true,
      allowPodcast: true,
      allowMechanicalRepro: true,
      allowRemix: true,
      allowRemixDistribution: true,
      allowSampling: false,
      allowMonetization: true,
      allowContentId: true,

      isExclusive: false,
      allowCommercialUse: true,
      commercialUseLimit: 'unlimited',

      allowedTerritories: ['WORLDWIDE'],
      durationMonths: null,

      allowTransfer: true,
      allowSublicense: true,
      transferRestrictions: 'Requires written notice to original licensor.',

      requireMasterCredit: true,
      requirePublishingCredit: true,
      requireArtistCredit: true,
      creditRequirements: '[Artist] - [Track Remix] by [Remixer] (euks.io)',

      masterSplitPercentage: 60,
      publishingSplitPercentage: 25,
      thirdPartySplitPercentage: 15,

      minAudioBitrate: '320',
      requireDrmEncryption: false,
      allowOfflineListening: true,
      maxConcurrentStreams: null,

      allowTrackModification: true,
      requireApprovalForModification: false,
      modificationRestrictions: 'No destructive edits to original artist intent.',

      allowNonprofitUse: true,
      allowEducationalUse: true,
      allowReligiousUse: true,
      allowPoliticalUse: false,
      allowAdultContent: true,
      allowGamblingUse: false,
      allowMilitaryUse: false,

      additionalTerms: 'Includes stems for production use. Full remix rights with proper credit. Live performance allowed. Can be sublicensed to derivative works.',
    })

    // === TEMPLATE UNLIMITED - Comprehensive rights ===
    await License.create({
      title: 'Unlimited License',
      description: 'Wide-open commercial license for projects with no practical ceiling. Nearly all rights included.',
      isPaypalEnabled: true,
      isActive: true,
      sortOrder: 40,
      isTemplate: true,
      templateCategory: 'premium',

      audioFormats: ['mp3', 'wav', 'flac', 'aiff'],
      trackSeparation: 'stems',

      maxStreams: null,
      maxDownloads: null,
      maxSales: null,

      allowVideoClips: true,
      videoClipsLimit: null,
      allowedPlatforms: ['tiktok', 'youtube', 'instagram', 'twitch', 'facebook', 'snapchat'],

      allowLivePerformance: true,
      allowRadioAirplay: true,
      allowTelevision: true,
      allowStreaming: true,
      allowPodcast: true,
      allowMechanicalRepro: true,
      allowRemix: true,
      allowRemixDistribution: true,
      allowSampling: true,
      allowMonetization: true,
      allowContentId: true,

      isExclusive: false,
      allowCommercialUse: true,
      commercialUseLimit: 'unlimited',

      allowedTerritories: ['WORLDWIDE'],
      durationMonths: null,

      allowTransfer: true,
      allowSublicense: true,

      requireMasterCredit: true,
      requirePublishingCredit: true,
      requireArtistCredit: true,
      creditRequirements: '[Artist] - [Track] (euks.io)',

      masterSplitPercentage: 50,
      publishingSplitPercentage: 25,
      thirdPartySplitPercentage: 25,

      minAudioBitrate: 'lossless',
      requireDrmEncryption: false,
      allowOfflineListening: true,
      maxConcurrentStreams: null,

      allowTrackModification: true,
      requireApprovalForModification: false,

      allowNonprofitUse: true,
      allowEducationalUse: true,
      allowReligiousUse: true,
      allowPoliticalUse: true,
      allowAdultContent: true,
      allowGamblingUse: true,
      allowMilitaryUse: false,

      additionalTerms: 'Comprehensive commercial rights. Unlimited streaming, sales, downloads. Full remix & sampling rights. Broadcasting allowed.',
    })

    // === TEMPLATE EXCLUSIVE - Single artist rights ===
    await License.create({
      title: 'Exclusive Rights',
      description: 'Exclusive purchase handled manually through quote and negotiation. Unique terms per agreement.',
      isPaypalEnabled: false,
      isActive: true,
      sortOrder: 50,
      isTemplate: true,
      templateCategory: 'exclusive',

      audioFormats: null,
      trackSeparation: null,

      maxStreams: null,
      maxDownloads: null,
      maxSales: null,

      allowVideoClips: false,
      allowedPlatforms: null,

      allowLivePerformance: false,
      allowRadioAirplay: false,
      allowTelevision: false,
      allowStreaming: false,
      allowPodcast: false,
      allowMechanicalRepro: false,
      allowRemix: false,
      allowRemixDistribution: false,
      allowSampling: false,
      allowMonetization: false,
      allowContentId: false,

      isExclusive: true,
      allowCommercialUse: false,
      commercialUseLimit: null,

      allowedTerritories: null,
      durationMonths: 12,

      allowTransfer: false,
      allowSublicense: false,

      requireMasterCredit: false,
      requirePublishingCredit: false,
      requireArtistCredit: false,

      masterSplitPercentage: 0,
      publishingSplitPercentage: 0,
      thirdPartySplitPercentage: 0,

      minAudioBitrate: null,
      requireDrmEncryption: false,
      allowOfflineListening: false,

      allowNonprofitUse: false,
      allowEducationalUse: false,
      allowReligiousUse: false,
      allowPoliticalUse: false,
      allowAdultContent: false,
      allowGamblingUse: false,
      allowMilitaryUse: false,

      additionalTerms: 'Exclusive rights negotiated per case. Contact for custom terms and pricing.',
      requiresWrittenAgreement: true,
    })
  }
}
