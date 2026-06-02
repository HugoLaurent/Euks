# Guide Frontend - Système Avancé de Licenses

## 🎯 Objectif

Permettre aux utilisateurs (admin/owner) de créer et gérer des licenses très flexibles avec des centaines de paramètres configurables.

## 📱 Interface Recommandée

### Vue 1: Listing des Licenses

```
┌─────────────────────────────────────────────────────┐
│ Licenses Disponibles                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Filtre: [Templates only] [Active only] [PayPal OK] │
│                                                     │
│ ┌─ BASIC LICENSE                          [15$] ── │
│ │  Entry-level for demos & social         Edit/Del│
│ │  🎵 MP3 • Videos: 1 • Streams: 100k              │
│ │  ❌ No monetization • ❌ No remix                │
│ │                                                   │
│ ├─ PREMIUM                                 [35$] ── │
│ │  Standard commercial                   Edit/Del│
│ │  🎵 MP3, WAV • ∞ Videos • ∞ Streams             │
│ │  ✅ Monetization • ❌ No remix                  │
│ │                                                   │
│ ├─ PREMIUM PLUS                            [75$] ── │
│ │  Advanced rights with remixes            Edit/Del│
│ │  🎵 MP3, WAV, FLAC, AIFF (STEMS) • ∞ Videos     │
│ │  ✅ Everything + Remix + Live Performance       │
│ │                                                   │
│ └─ [+ CREATE NEW LICENSE]                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Vue 2: Création/Édition (Formulaire Complexe)

```
┌──────────────────────────────────────────────────────┐
│ Create License: Advanced Configuration               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ BASICS                                              │
│ ┌────────────────────────────────────────────────┐ │
│ │ Title: [My Custom License        ]  *Required  │ │
│ │ Description: [lengthy description here...]     │ │
│ │                                                │ │
│ │ ☑ Is Template    Category: [Standard ▼]       │ │
│ │ ☑ Active         ☐ PayPal Enabled             │ │
│ │ ☑ Exclusive                                   │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ AUDIO & FORMATS                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Allowed Formats:                                │ │
│ │ ☑ MP3    ☑ WAV    ☐ FLAC    ☐ AIFF            │ │
│ │ ☐ AAC    ☐ OGG                                 │ │
│ │                                                │ │
│ │ Track Separation: [Full Mix ▼]                │ │
│ │   • Full Mix              - Complete track    │ │
│ │   • Stems                 - Individual stems  │ │
│ │   • Instrumental Only      - No vocals        │ │
│ │   • Vocal Only            - Vocals only      │ │
│ │   • Acapella              - A cappella       │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ DISTRIBUTION LIMITS                                  │
│ ┌────────────────────────────────────────────────┐ │
│ │ Max Streams:     [100000        ] (∞ if empty) │ │
│ │ Max Downloads:   [1000          ] (∞ if empty) │ │
│ │ Max Sales:       [             ] (∞ if empty) │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ VIDEO CONTENT                                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ ☑ Allow Video Clips        Limit: [1]          │ │
│ │                                                │ │
│ │ Allowed Platforms:                             │ │
│ │ ☑ TikTok   ☑ YouTube   ☑ Instagram             │ │
│ │ ☑ Twitch   ☑ Facebook  ☐ Snapchat             │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ [Show More Options ▼]   [Save]  [Cancel]           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Quand on clique "Show More Options":

```
│ USAGE RIGHTS (Extended)                              │
│ ┌────────────────────────────────────────────────┐ │
│ │ ☐ Live Performance                             │ │
│ │ ☐ Radio Airplay                                │ │
│ │ ☑ Television                                   │ │
│ │ ☑ Streaming (Spotify, Apple Music)            │ │
│ │ ☐ Podcast (Background music)                  │ │
│ │ ☐ Mechanical Reproduction (Karaoke, covers)   │ │
│ │ ☑ Remix Creation                              │ │
│ │ ☑ Remix Distribution (Publish remixes)        │ │
│ │ ☐ Sampling (Use as sample in other tracks)    │ │
│ │ ☑ Monetization (AdSense, YouTube Partner)     │ │
│ │ ☑ Content ID (YouTube Copyright system)       │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ COMMERCIAL USE                                       │
│ ┌────────────────────────────────────────────────┐ │
│ │ ☑ Allow Commercial Use                        │ │
│ │                                                │ │
│ │ Limitation: [Unlimited ▼]                     │ │
│ │   • Unlimited         - No restrictions      │ │
│ │   • Limited           - Revenue cap or terms │ │
│ │   • Prohibited        - No commercial use   │ │
│ │                                                │ │
│ │ Description: [details about limitations...]  │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ TERRITORY & DURATION                                 │
│ ┌────────────────────────────────────────────────┐ │
│ │ Allowed Territories:                           │ │
│ │ ☑ Worldwide    ☑ US    ☑ FR    ☐ DE    ☑ UK   │ │
│ │ ☐ JP    ☐ CN    ☐ BR    ☑ CA    ☑ AU           │
│ │ [Search countries...]                        │ │
│ │                                                │ │
│ │ Duration: [Perpetual ▼]                      │ │
│ │   • Perpetual        - No time limit         │ │
│ │   • 12 months        - 1 year                │ │
│ │   • Custom range     - From/To dates        │ │
│ │                                                │ │
│ │ Start Date: [2026-04-25]                     │ │
│ │ End Date:   [2027-04-25]                     │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ TRANSFER & SUBLICENSE                                │
│ ┌────────────────────────────────────────────────┐ │
│ │ ☐ Allow Transfer (Give to someone else)      │ │
│ │ ☑ Allow Sublicense (Resell/license further)  │ │
│ │                                                │ │
│ │ Transfer Restrictions: [text here...]         │ │
│ │ [Requires written notice to licensor]         │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ATTRIBUTION & SPLITS                                 │
│ ┌────────────────────────────────────────────────┐ │
│ │ Credits Requirements:                          │ │
│ │ ☑ Require Master Credit                       │ │
│ │ ☑ Require Publishing Credit                   │ │
│ │ ☑ Require Artist Credit                       │ │
│ │                                                │ │
│ │ Credit Format: [[Artist] - [Track] (euks.io)]│ │
│ │                                                │ │
│ │ Revenue Split Distribution:                   │ │
│ │ Master Split:        [70 %]  ◀─────────────┐ │
│ │ Publishing Split:    [20 %]  │ Total: 100% │ │
│ │ Third-party Split:   [10 %]  ◀─────────────┘ │
│ │                                                │ │
│ │ ⚠️  Splits must total ≤ 100%                  │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ TECHNICAL RESTRICTIONS                               │
│ ┌────────────────────────────────────────────────┐ │
│ │ Minimum Audio Bitrate: [320 kbps ▼]          │ │
│ │   • 128 kbps   - Low quality                  │ │
│ │   • 192 kbps   - Fair quality                 │ │
│ │   • 256 kbps   - Good quality                 │ │
│ │   • 320 kbps   - High quality (MP3)          │ │
│ │   • Lossless   - Uncompressed (WAV, FLAC)   │ │
│ │                                                │ │
│ │ ☐ Require DRM Encryption (Apple FairPlay)    │ │
│ │ ☑ Allow Offline Listening (Downloads)        │ │
│ │ Max Concurrent Streams: [unlimited ▼]        │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ MODIFICATIONS                                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ ☑ Allow Track Modification (Edits, mixing)   │ │
│ │ ☐ Require Approval for Modification          │ │
│ │                                                │ │
│ │ Restrictions: [No destructive edits...]      │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ RESTRICTED USES                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ ☑ Allow Nonprofit Use                         │ │
│ │ ☑ Allow Educational Use                       │ │
│ │ ☑ Allow Religious Use                         │ │
│ │ ☐ Allow Political Use                         │ │
│ │ ☑ Allow Adult Content                         │ │
│ │ ☐ Allow Gambling/Casino Use                   │ │
│ │ ☐ Allow Military Use                          │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ ADDITIONAL RESTRICTIONS                              │
│ ┌────────────────────────────────────────────────┐ │
│ │ Restricted Genres: [harsh_noise, lo-fi]      │ │
│ │ [x] Add more...                               │ │
│ │                                                │ │
│ │ Restricted Use Cases: [weapons_ads, hate]    │ │
│ │ [x] Add more...                               │ │
│ │                                                │ │
│ │ Additional Terms (Custom text):                │ │
│ │ ┌────────────────────────────────────────┐    │ │
│ │ │ Custom restrictions and special        │    │ │
│ │ │ conditions for this license...         │    │ │
│ │ └────────────────────────────────────────┘    │ │
│ │                                                │ │
│ │ ☑ Requires Written Agreement                  │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ VERSIONING                                           │
│ ┌────────────────────────────────────────────────┐ │
│ │ Revision Date: [2026-04-25]                   │ │
│ │ Revision Notes: [Added podcast rights v2...] │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│ [Validate]  [Save as Template]  [Save]  [Cancel]   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 🔍 Validation Côté Frontend

Avant d'envoyer au backend, vérifier:

```javascript
// 1. Splits totalisent ≤ 100%
const totalSplits = master + publishing + thirdParty
if (totalSplits > 100) {
  showError('Splits must total ≤ 100%')
  return
}

// 2. Titre et description requis
if (!title?.trim() || title.length > 160) {
  showError('Title required, max 160 chars')
  return
}

// 4. Cohérence des droits
if (!allowRemix && allowRemixDistribution) {
  showWarning('Cannot distribute remixes if remix not allowed')
}

if (!allowSampling && allowSampling) {
  showWarning('Sampling requires sampling rights')
}

// 4. Durée requise si exclusive
if (isExclusive && !durationMonths) {
  showError('Exclusive licenses must have duration')
  return
}

// 5. Crédits requis si demandés
if (requireArtistCredit && !creditRequirements?.trim()) {
  showError('Credit requirements must be specified')
  return
}
```

## 📊 Affichage des Licenses avec Badges

```javascript
const badges = [
  license.allowRemix && '🔄 Remix',
  license.allowLivePerformance && '🎤 Live',
  license.allowRadioAirplay && '📻 Radio',
  license.allowTelevision && '📺 TV',
  license.allowSampling && '🎧 Sampling',
  license.isExclusive && '⭐ Exclusive',
  license.allowMonetization && '💰 Monetize',
]

// Affichage compact:
// 🔄 Remix • 🎤 Live • 📻 Radio • 💰 Monetize • ⭐ Exclusive
```

## 🎬 Flow Complet d'Utilisation

### Étape 1: Admin crée une license custom
```
1. Click "Create License"
2. Fill: title, description
3. Select template category
4. Configure audio formats & separation
5. Set distribution limits (streams, downloads)
6. Configure video/platform rights
7. Set usage rights (remix, live, etc.)
8. Define commercial use terms
9. Set territory & duration
10. Configure attribution & splits
11. Add technical restrictions if needed
12. Save & activate
```

### Étape 2: License apparaît dans listing public
```
GET /licenses → License visible avec tous les paramètres
```

### Étape 3: Creator attache license à track
```
Dans la page de gestion du track:
"Attach Licenses"
- Select available licenses
- Set price per license (if not predefined)
- Activate/Deactivate individually
```

### Étape 4: Buyer voit les options
```
Track page → "Available Licenses"
- See all compatible licenses
- Filter by features (remix, live, etc.)
- Compare licenses side-by-side
- Check terms & conditions
- Purchase via PayPal
```

## 🔄 Comparateur de Licenses

```
┌────────────────────────────────────────────────────┐
│ Compare Licenses                                   │
├────────────────────────────────────────────────────┤
│                                                    │
│            BASIC      PREMIUM   PREMIUM PLUS       │
│ ────────────────────────────────────────────      │
│ Price         $15        $35        $75           │
│ Formats       MP3        MP3+WAV    All+STEMS     │
│ Streams       100k        ∞          ∞            │
│ Videos        1           ∞          ∞            │
│ Remix         ❌          ❌         ✅           │
│ Live          ❌          ❌         ✅           │
│ Radio         ❌          ❌         ✅           │
│ TV            ❌          ❌         ❌           │
│ Monetize      ❌          ✅         ✅           │
│ Sampling      ❌          ❌         ❌           │
│ Transfer      ❌          ❌         ✅           │
│ Sublicense    ❌          ❌         ✅           │
│                                                    │
│ [Choose BASIC]  [Choose PREMIUM]  [Choose PLUS]  │
│                                                    │
└────────────────────────────────────────────────────┘
```

## 📋 Checklist pour Admin avant Activation

```
□ Title & description clear
□ All required fields filled
□ Splits total ≤ 100%
□ No contradictory rights
□ Territory specified
□ Duration specified (or perpetual)
□ Price set (if PayPal enabled)
□ Credits requirements clear
□ Additional terms complete (if needed)
□ Written agreement requirement flagged (if exclusive)
□ Ready for production
```

---

**Dernière mise à jour**: 25 avril 2026
