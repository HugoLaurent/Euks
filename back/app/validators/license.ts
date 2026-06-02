import vine from '@vinejs/vine'

export const audioFormatsEnum = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'aiff'] as const
export const trackSeparationEnum = [
  'full_mix',
  'stems',
  'instrumental_only',
  'vocal_only',
  'acapella',
] as const
export const platformsEnum = [
  'tiktok',
  'youtube',
  'instagram',
  'twitch',
  'facebook',
  'snapchat',
] as const
export const commercialUseLimitEnum = ['unlimited', 'limited', 'prohibited'] as const
export const minAudioBitrateEnum = ['128', '192', '256', '320', 'lossless'] as const
export const templateCategoryEnum = ['standard', 'premium', 'exclusive', 'custom'] as const

// ISO country codes (simplified list)
export const territoriesEnum = [
  'US',
  'FR',
  'DE',
  'GB',
  'IT',
  'ES',
  'JP',
  'CN',
  'BR',
  'CA',
  'AU',
  'NZ',
  'SG',
  'HK',
  'IN',
  'MX',
  'WORLDWIDE',
] as const

const baseLicenseSchema = vine.object({
  title: vine.string().trim().minLength(1).maxLength(160),
  description: vine.string().trim().maxLength(4000).nullable().optional(),

  // === BASICS ===
  isPaypalEnabled: vine.boolean().optional(),
  isActive: vine.boolean().optional(),
  sortOrder: vine.number().withoutDecimals().nonNegative().optional(),
  priceCents: vine.number().withoutDecimals().nonNegative().optional(),

  // === AUDIO FORMATS ===
  audioFormats: vine.array(vine.enum(audioFormatsEnum)).nullable().optional(),
  trackSeparation: vine.enum(trackSeparationEnum).nullable().optional(),

  // === DISTRIBUTION LIMITS ===
  maxStreams: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  maxDownloads: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  maxSales: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  radioStations: vine.number().withoutDecimals().nonNegative().nullable().optional(),

  // === VIDEO CONTENT ===
  allowVideoClips: vine.boolean().optional(),
  videoClipsLimit: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  allowedPlatforms: vine.array(vine.enum(platformsEnum)).nullable().optional(),

  // === USAGE RIGHTS ===
  allowLivePerformance: vine.boolean().optional(),
  allowRadioAirplay: vine.boolean().optional(),
  allowTelevision: vine.boolean().optional(),
  allowStreaming: vine.boolean().optional(),
  allowPodcast: vine.boolean().optional(),
  allowMechanicalRepro: vine.boolean().optional(),
  allowRemix: vine.boolean().optional(),
  allowRemixDistribution: vine.boolean().optional(),
  allowSampling: vine.boolean().optional(),
  allowMonetization: vine.boolean().optional(),
  allowContentId: vine.boolean().optional(),

  // === COMMERCIALITY ===
  isExclusive: vine.boolean().optional(),
  allowCommercialUse: vine.boolean().optional(),
  commercialUseLimit: vine.enum(commercialUseLimitEnum).nullable().optional(),
  commercialUseDescription: vine.string().trim().maxLength(2000).nullable().optional(),

  // === TERRITORIAL & DURATION ===
  allowedTerritories: vine.array(vine.enum(territoriesEnum)).nullable().optional(),
  durationMonths: vine.number().withoutDecimals().nonNegative().nullable().optional(),
  licenseStartDate: vine.date().nullable().optional(),
  licenseEndDate: vine.date().nullable().optional(),

  // === TRANSFER & SUBLICENSE ===
  allowTransfer: vine.boolean().optional(),
  allowSublicense: vine.boolean().optional(),
  transferRestrictions: vine.string().trim().maxLength(2000).nullable().optional(),

  // === ATTRIBUTION & SPLITS ===
  requireMasterCredit: vine.boolean().optional(),
  requirePublishingCredit: vine.boolean().optional(),
  requireArtistCredit: vine.boolean().optional(),
  creditRequirements: vine.string().trim().maxLength(2000).nullable().optional(),

  masterSplitPercentage: vine.number().min(0).max(100).optional(),
  publishingSplitPercentage: vine.number().min(0).max(100).optional(),
  thirdPartySplitPercentage: vine.number().min(0).max(100).optional(),

  // === TECHNICAL RESTRICTIONS ===
  minAudioBitrate: vine.enum(minAudioBitrateEnum).nullable().optional(),
  requireDrmEncryption: vine.boolean().optional(),
  allowOfflineListening: vine.boolean().optional(),
  maxConcurrentStreams: vine.number().withoutDecimals().nonNegative().nullable().optional(),

  // === MODIFICATIONS ===
  allowTrackModification: vine.boolean().optional(),
  requireApprovalForModification: vine.boolean().optional(),
  modificationRestrictions: vine.string().trim().maxLength(2000).nullable().optional(),

  // === RESTRICTED USES ===
  allowNonprofitUse: vine.boolean().optional(),
  allowEducationalUse: vine.boolean().optional(),
  allowReligiousUse: vine.boolean().optional(),
  allowPoliticalUse: vine.boolean().optional(),
  allowAdultContent: vine.boolean().optional(),
  allowGamblingUse: vine.boolean().optional(),
  allowMilitaryUse: vine.boolean().optional(),

  // === RESTRICTIONS ===
  restrictedGenres: vine.array(vine.string().trim()).nullable().optional(),
  restrictedUseCases: vine.array(vine.string().trim()).nullable().optional(),
  additionalTerms: vine.string().trim().maxLength(5000).nullable().optional(),
  requiresWrittenAgreement: vine.boolean().optional(),

  // === VERSIONING ===
  revisionDate: vine.date().nullable().optional(),
  revisionNotes: vine.string().trim().maxLength(2000).nullable().optional(),
  isTemplate: vine.boolean().optional(),
  templateCategory: vine.enum(templateCategoryEnum).nullable().optional(),
})

export const createLicenseValidator = vine.create(baseLicenseSchema)
export const updateLicenseValidator = vine.create(baseLicenseSchema.partial())
