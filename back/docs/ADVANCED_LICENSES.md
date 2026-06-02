# Système Avancé de Licenses - Documentation Complète

**Date**: 25 avril 2026  
**Status**: ✅ Implémenté et prêt pour intégration

---

## 📋 Vue d'ensemble

Le système de licenses a été considérablement étendu pour supporter des scénarios complexes de licensing musical. Les utilisateurs peuvent créer des templates de licenses réutilisables avec des paramètres très granulaires.

## 🏗️ Architecture

### Niveaux de configurations

#### 1. **Audio & Format**
```json
{
  "audioFormats": ["mp3", "wav", "flac", "aiff", "aac", "ogg"],
  "trackSeparation": "full_mix | stems | instrumental_only | vocal_only | acapella"
}
```

- `audioFormats` : Formats audio autorisés (permet filtrer par qualité)
- `trackSeparation` : Type de séparation fournie aux acheteurs

#### 2. **Plafonds de Distribution**
```json
{
  "maxStreams": 100000,
  "maxDownloads": 1000,
  "maxSales": null
}
```

- `null` = illimité
- Plafonds cumulatifs ou par utilisateur (déterminer au niveau métier)

#### 3. **Vidéos et Plateformes**
```json
{
  "allowVideoClips": true,
  "videoClipsLimit": 1,
  "allowedPlatforms": ["tiktok", "youtube", "instagram", "twitch", "facebook", "snapchat"]
}
```

- `videoClipsLimit` : Nombre de vidéos/clips autorisés
- `allowedPlatforms` : Restriction par plateforme

#### 4. **Droits d'Usage**
```json
{
  "allowLivePerformance": true,
  "allowRadioAirplay": true,
  "allowTelevision": true,
  "allowStreaming": true,
  "allowPodcast": true,
  "allowMechanicalRepro": false,
  "allowRemix": true,
  "allowRemixDistribution": true,
  "allowSampling": false,
  "allowMonetization": true,
  "allowContentId": true
}
```

Détails:
- `allowLivePerformance` : Concerts, festivals en direct
- `allowRadioAirplay` : Diffusion radio/broadcast
- `allowTelevision` : Films, séries, TV
- `allowStreaming` : Spotify, Apple Music, etc.
- `allowPodcast` : Musique de fond dans podcasts
- `allowMechanicalRepro` : Karaoké, covers publiques
- `allowRemix` : Créer des remixes
- `allowRemixDistribution` : Publier/vendre les remixes
- `allowSampling` : Utiliser en samples dans d'autres tracks
- `allowMonetization` : Monétiser (AdSense, etc.)
- `allowContentId` : YouTube Content ID

#### 5. **Commercialité**
```json
{
  "isExclusive": false,
  "allowCommercialUse": true,
  "commercialUseLimit": "unlimited | limited | prohibited",
  "commercialUseDescription": "For personal & small business only..."
}
```

- `isExclusive` : Une seule personne/label peut l'utiliser
- `commercialUseLimit` : Plafonds revenue ou restrictions
- `commercialUseDescription` : Texte libre pour préciser

#### 6. **Territoire et Durée**
```json
{
  "allowedTerritories": ["US", "FR", "DE", "WORLDWIDE"],
  "durationMonths": 12,
  "licenseStartDate": "2026-04-25",
  "licenseEndDate": "2027-04-25"
}
```

- `allowedTerritories` : Codes ISO pays ou WORLDWIDE
- `durationMonths` : Durée en mois (null = perpétuel)
- Dates optionnelles pour conditions précises

#### 7. **Transfert et Sous-licence**
```json
{
  "allowTransfer": false,
  "allowSublicense": true,
  "transferRestrictions": "Requires written notice..."
}
```

- `allowTransfer` : Transférer à quelqu'un d'autre
- `allowSublicense` : Concéder les droits à un tiers
- `transferRestrictions` : Conditions supplémentaires

#### 8. **Attribution et Splits**
```json
{
  "requireMasterCredit": true,
  "requirePublishingCredit": true,
  "requireArtistCredit": true,
  "creditRequirements": "[Artist] - [Track] (euks.io)",
  "masterSplitPercentage": 70,
  "publishingSplitPercentage": 15,
  "thirdPartySplitPercentage": 15
}
```

- Crédits : Où et comment mentionner les artistes
- Splits : Distribution des revenus (DOIT totaliser ≤ 100%)
- Master : Propriétaire de l'enregistrement
- Publishing : Compositeur/éditeur
- Third party : Autres intervenants

#### 9. **Restrictions Techniques**
```json
{
  "minAudioBitrate": "128 | 192 | 256 | 320 | lossless",
  "requireDrmEncryption": false,
  "allowOfflineListening": true,
  "maxConcurrentStreams": 1
}
```

- `minAudioBitrate` : Qualité minimum exigée
- `requireDrmEncryption` : DRM protection (Apple FairPlay, etc.)
- `allowOfflineListening` : Téléchargement hors-ligne
- `maxConcurrentStreams` : Restriction par session

#### 10. **Modifications et Versioning**
```json
{
  "allowTrackModification": true,
  "requireApprovalForModification": false,
  "modificationRestrictions": "No destructive edits...",
  "revisionDate": "2026-04-25",
  "revisionNotes": "Added podcast rights"
}
```

- Contrôle des modifications (remix, édition)
- Historique de révision des licenses

#### 11. **Usage Restreint**
```json
{
  "allowNonprofitUse": true,
  "allowEducationalUse": true,
  "allowReligiousUse": true,
  "allowPoliticalUse": false,
  "allowAdultContent": true,
  "allowGamblingUse": false,
  "allowMilitaryUse": false
}
```

Catégories sensibles où l'utilisation peut être restreinte.

#### 12. **Restrictions Supplémentaires**
```json
{
  "restrictedGenres": ["harsh_noise", "lo-fi"],
  "restrictedUseCases": ["weapons_ads", "hate_speech"],
  "additionalTerms": "Custom terms...",
  "requiresWrittenAgreement": true
}
```

- Genres interdits ou contexts interdits
- Texte libre pour conditions spéciales
- Flag pour accord écrit obligatoire

---

## 📦 Templates Pré-configurés

Le système inclut 7 templates réutilisables :

### 1. **Basic** (Entry-level)
- Formats: MP3
- Streams: 100k max
- Videos: 1 clip max
- No monetization
- Idéal pour: TikTok, Instagram Shorts
- **Prix recommandé**: $15-25

### 2. **Premium** (Standard commercial)
- Formats: MP3, WAV
- Unlimited streams & downloads
- Unlimited videos
- Monetization: ✅ (YouTube Content ID)
- Live: ❌ | Radio: ❌ | TV: ❌
- Idéal pour: Streaming digital, podcasts
- **Prix recommandé**: $35-50

### 3. **Premium Plus** (Advanced)
- Formats: MP3, WAV, FLAC, AIFF
- Includes stems
- All digital rights + Live + Radio
- Remix: ✅ (distribution autorisée)
- Sampling: ❌ | TV: ❌
- Idéal pour: Production pro, remixeurs, labels indépendants
- **Prix recommandé**: $75-150

### 4. **Unlimited** (Comprehensive)
- Formats: Tous (lossless)
- TOUTES les droits numériques
- Live + Radio + TV + Podcast ✅
- Remix + Sampling ✅
- Transfer + Sublicense ✅
- Idéal pour: Films, TV, broadcast, jeux vidéo
- **Prix recommandé**: $250-1000+

### 5. **Exclusive** (Negotiated)
- Droits complètement custom
- Durée: 12 mois par défaut (négociable)
- Requires written agreement
- PayPal: ❌ (Devis manuel)
- Idéal pour: Clients spéciaux, exclusivité

### 6. **Podcast** (Specialized)
- Optimisé pour podcasts uniquement
- Streams/downloads: Illimitées
- No video, no sampling
- Monetization: ✅
- Idéal pour: Musique de fond podcast
- **Prix recommandé**: $20-40

### 7. **Film & TV** (Broadcast)
- Includes broadcasting rights
- TV + Radio + Streaming ✅
- Remix allowed (no distribution)
- No sampling
- Higher quality requirement (320kbps min)
- Idéal pour: Projets audiovisuels
- **Prix recommandé**: $150-500

---

## 🔌 Endpoints API

### Lister les licenses (public)
```
GET /api/v1/licenses
?activeOnly=true&paypalOnly=false&isTemplate=true&templateCategory=standard
```

**Query params**:
- `activeOnly` (bool): Seulement les actives
- `paypalOnly` (bool): Seulement les vendues via PayPal
- `isTemplate` (bool): Seulement les templates
- `templateCategory` (string): 'standard' | 'premium' | 'exclusive' | 'custom'

**Réponse**:
```json
[
  {
    "id": 1,
    "key": "basic",
    "title": "Basic License",
    "description": "...",
    "isActive": true,
    "isTemplate": true,
    "templateCategory": "standard",
    "audioFormats": ["mp3"],
    "trackSeparation": "full_mix",
    "maxStreams": 100000,
    "maxDownloads": 1000,
    "maxSales": null,
    "allowVideoClips": true,
    "videoClipsLimit": 1,
    "allowedPlatforms": ["tiktok", "instagram", "youtube"],
    "allowLivePerformance": false,
    "allowRadioAirplay": false,
    "allowTelevision": false,
    "allowStreaming": true,
    "allowPodcast": false,
    "allowMechanicalRepro": false,
    "allowRemix": false,
    "allowRemixDistribution": false,
    "allowSampling": false,
    "allowMonetization": false,
    "allowContentId": false,
    "isExclusive": false,
    "allowCommercialUse": true,
    "commercialUseLimit": "limited",
    "commercialUseDescription": "For personal & small business use only...",
    "allowedTerritories": ["WORLDWIDE"],
    "durationMonths": null,
    "allowTransfer": false,
    "allowSublicense": false,
    "transferRestrictions": null,
    "requireMasterCredit": true,
    "requirePublishingCredit": true,
    "requireArtistCredit": true,
    "creditRequirements": "[Artist] - [Track] (euks.io)",
    "masterSplitPercentage": 0,
    "publishingSplitPercentage": 0,
    "thirdPartySplitPercentage": 0,
    "minAudioBitrate": "128",
    "requireDrmEncryption": false,
    "allowOfflineListening": false,
    "maxConcurrentStreams": null,
    "allowTrackModification": false,
    "requireApprovalForModification": false,
    "modificationRestrictions": null,
    "allowNonprofitUse": true,
    "allowEducationalUse": true,
    "allowReligiousUse": true,
    "allowPoliticalUse": false,
    "allowAdultContent": true,
    "allowGamblingUse": false,
    "allowMilitaryUse": false,
    "restrictedGenres": null,
    "restrictedUseCases": null,
    "additionalTerms": "Suitable for TikTok, Instagram, YouTube Shorts...",
    "requiresWrittenAgreement": false,
    "revisionDate": null,
    "revisionNotes": null,
    "isPaypalEnabled": true,
    "sortOrder": 10,
    "createdAt": "2026-04-25T00:00:00.000Z",
    "updatedAt": "2026-04-25T00:00:00.000Z"
  }
]
```

### Créer une license custom (admin/owner)
```
POST /api/v1/licenses
Headers: Authorization: Bearer <token>

Body: (Tous les champs optionnels sauf key & title)
{
  "key": "my_custom_license",
  "title": "My Custom License",
  "description": "Custom license for specific use case",
  "isActive": true,
  "isTemplate": false,
  "audioFormats": ["mp3", "wav"],
  "trackSeparation": "full_mix",
  "maxStreams": 50000,
  "allowLivePerformance": true,
  "allowRadioAirplay": false,
  "allowMonetization": true,
  "isExclusive": false,
  "allowCommercialUse": true,
  "masterSplitPercentage": 70,
  "publishingSplitPercentage": 20,
  "thirdPartySplitPercentage": 10,
  "additionalTerms": "Custom terms for this license..."
}

Response (201):
{ ...license object... }
```

### Modifier une license (admin/owner)
```
PATCH /api/v1/licenses/:id
Headers: Authorization: Bearer <token>

Body: (N'importe quels champs à mettre à jour)
{
  "maxStreams": 200000,
  "allowMonetization": false,
  "additionalTerms": "Updated terms..."
}

Response (200):
{ ...updated license object... }
```

### Supprimer une license
```
DELETE /api/v1/licenses/:id
Headers: Authorization: Bearer <token>

Response (204): No Content
```

---

## 🎯 Règles de Validation

### 1. **Validation Splits**
```typescript
masterSplitPercentage + publishingSplitPercentage + thirdPartySplitPercentage ≤ 100%
```
❌ Erreur si total > 100%
✅ Permet valeurs nulles (interprétées comme 0)

### 2. **Validation Clés Uniques**
```typescript
key doit être unique (case-sensitive)
Format: ^[a-z][a-zA-Z0-9_]*$
```
Exemples valides:
- `basic`
- `premiumPlus`
- `film_tv`
- `exclusive_2026`

### 3. **Validation Longueurs**
- `key`: max 80 caractères
- `title`: max 160 caractères
- `description`: max 4000 caractères
- `additionalTerms`: max 5000 caractères
- `creditRequirements`: max 2000 caractères

### 4. **Validation Enums**

**audioFormats**:
```
['mp3', 'wav', 'flac', 'aac', 'ogg', 'aiff']
```

**trackSeparation**:
```
['full_mix', 'stems', 'instrumental_only', 'vocal_only', 'acapella']
```

**allowedPlatforms**:
```
['tiktok', 'youtube', 'instagram', 'twitch', 'facebook', 'snapchat']
```

**commercialUseLimit**:
```
['unlimited', 'limited', 'prohibited']
```

**minAudioBitrate**:
```
['128', '192', '256', '320', 'lossless']
```

**templateCategory**:
```
['standard', 'premium', 'exclusive', 'custom']
```

**territories**:
```
ISO country codes: 'US', 'FR', 'DE', 'GB', 'IT', 'ES', 'JP', 'CN', etc.
Ou 'WORLDWIDE' pour partout
```

---

## 📊 Cas d'Usage Courants

### Cas 1: Creator TikTok cherche license basique
→ Recommander: **Basic License**
- MP3 seulement
- Max 100k streams
- 1 video clip
- Pas de monétisation (mais peut partager sur TikTok)
- Budget: $15-25

### Cas 2: Producteur indépendant cherche droits complets
→ Recommander: **Premium Plus ou Unlimited**
- Stems inclus
- Remix autorisé
- Monétisation YouTube
- Live performance
- Budget: $75-1000+ selon les besoins

### Cas 3: Studio film cherche musique pour film
→ Recommander: **Film & TV ou Unlimited**
- Broadcasting rights
- TV allowed
- Qualité lossless
- Possible DRM
- Budget: $150-500+

### Cas 4: Artiste cherche exclusivité
→ Recommander: **Exclusive License**
- Conditions custom
- Accord écrit obligatoire
- Peut négocier tous les paramètres
- Pas disponible PayPal (devis manuel)
- Budget: Selon négociation

### Cas 5: Podcasteur cherche musique de fond
→ Recommander: **Podcast License**
- Streaming illimité
- Podcast autorisé
- Monétisation OK
- Pas de vidéos
- Budget: $20-40

---

## 🔧 Configuration Technique

### Migration de la Base de Données

La migration `1761886000000_create_advanced_licenses_table.ts` ajoute les colonnes suivantes:

```sql
-- Audio
audio_formats (JSON)
track_separation (string)

-- Distribution
max_streams (bigint)
max_downloads (bigint)
max_sales (bigint)

-- Video
allow_video_clips (boolean)
video_clips_limit (int)
allowed_platforms (JSON)

-- Usage (11 colonnes boolean)
allow_live_performance, allow_radio_airplay, allow_television, 
allow_streaming, allow_podcast, allow_mechanical_repro, allow_remix, 
allow_remix_distribution, allow_sampling, allow_monetization, 
allow_content_id

-- Commercial
is_exclusive (boolean)
allow_commercial_use (boolean)
commercial_use_limit (string)
commercial_use_description (text)

-- Territory & Duration
allowed_territories (JSON)
duration_months (int)
license_start_date (datetime)
license_end_date (datetime)

-- Transfer
allow_transfer (boolean)
allow_sublicense (boolean)
transfer_restrictions (text)

-- Attribution & Splits
require_master_credit (boolean)
require_publishing_credit (boolean)
require_artist_credit (boolean)
credit_requirements (text)
master_split_percentage (decimal 5,2)
publishing_split_percentage (decimal 5,2)
third_party_split_percentage (decimal 5,2)

-- Technical
min_audio_bitrate (string)
require_drm_encryption (boolean)
allow_offline_listening (boolean)
max_concurrent_streams (int)

-- Modifications
allow_track_modification (boolean)
require_approval_for_modification (boolean)
modification_restrictions (text)

-- Restricted Uses (7 colonnes boolean)
allow_nonprofit_use, allow_educational_use, allow_religious_use,
allow_political_use, allow_adult_content, allow_gambling_use,
allow_military_use

-- Restrictions
restricted_genres (JSON)
restricted_use_cases (JSON)
additional_terms (text)
requires_written_agreement (boolean)

-- Versioning
revision_date (datetime)
revision_notes (text)
is_template (boolean)
template_category (string)
```

### Modèle Lucid (License.ts)

Toutes les colonnes sont déclarées avec types TypeScript stricts:

```typescript
declare audioFormats: AudioFormat[] | null
declare masterSplitPercentage: number
declare allowMonetization: boolean
// ... etc
```

### Validateur (validators/license.ts)

Utilise Vine pour validation stricte:

```typescript
vine.array(vine.enum(audioFormatsEnum))
vine.number().min(0).max(100)
vine.enum(['unlimited', 'limited', 'prohibited'])
// etc
```

### Transformer (transformers/license_transformer.ts)

Retourne tous les champs (100+ propriétés):

```typescript
{
  id, key, title, description,
  audioFormats, trackSeparation,
  maxStreams, maxDownloads, maxSales,
  allowVideoClips, videoClipsLimit, allowedPlatforms,
  allowLivePerformance, allowRadioAirplay, // ... tous les droits
  isExclusive, allowCommercialUse,
  // ... tous les autres champs
}
```

---

## 📝 Migration et Seeding

### Exécuter la migration
```bash
node ace migration:run
```

### Seeder les templates
```bash
node ace db:seed
```

Le seeder `database/seeders/license_seeder.ts` crée 5 templates automatiquement:
1. Basic
2. Premium
3. Premium Plus
4. Unlimited
5. Exclusive

---

## 🚀 Intégration Frontend

### Afficher les licenses disponibles
```javascript
const response = await fetch('http://localhost:3333/api/v1/licenses?isTemplate=true')
const licenses = await response.json()
```

### Créer une license custom
```javascript
const newLicense = {
  key: 'my_license',
  title: 'My License',
  audioFormats: ['mp3', 'wav'],
  maxStreams: 100000,
  allowMonetization: true,
  masterSplitPercentage: 70,
  publishingSplitPercentage: 20,
  thirdPartySplitPercentage: 10
}

const response = await fetch('http://localhost:3333/api/v1/licenses', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newLicense)
})
```

### Filtrer licenses par capacité
```javascript
// Afficher seulement les licenses qui permettent les remixes
const allLicenses = await fetch('/api/v1/licenses').then(r => r.json())
const remixableLicenses = allLicenses.filter(l => l.allowRemix)
```

---

## 📚 Prochaines Étapes

### À faire sur le backend
- [ ] Ajouter endpoint `/licenses/available?usage=remix&format=wav` (filtrage avancé)
- [ ] Historique des mises à jour de licenses
- [ ] Endpoint d'audit (qui a changé quoi et quand)
- [ ] Templates publics vs privés (visible seulement par créateur)
- [ ] Duplication de template (clone existing license)

### À faire sur le frontend
- [ ] UI de création/édition de licenses (formulaire géant!)
- [ ] Preview des licenses configurées
- [ ] Comparateur de licenses
- [ ] Checker de compatibilité (track → licenses compatibles)
- [ ] Dashboard d'analytics par license

### À affiner
- [ ] Gérer les cas d'incompatibilité (ex: remix + sampling)
- [ ] Alerter si conditions contradictoires
- [ ] Recommandations automatiques basées sur use case
- [ ] Versioning complet des licenses (historique complet)

---

## 🤝 Questions Fréquentes

**Q: Puis-je mettre une license exclusive sur plusieurs tracks?**
A: Oui, une license type "exclusive" peut être appliquée à plusieurs tracks. L'exclusivité signifie que seulement une personne peut acheter cette license (une fois vendue, elle n'est plus dispo).

**Q: Comment gérer les droits de "tiers"?**
A: Utiliser `thirdPartySplitPercentage` + `creditRequirements` pour documenter qui doit être crédité et comment.

**Q: Peut-on avoir une license sans aucun droit?**
A: Théoriquement oui, mais c'est inutile. Le minimum serait `allowStreaming: true`.

**Q: Les plafonds sont-ils cumulatifs?**
A: À définir au niveau métier. Actuellement stockés en base, mais pas géré au backend. À implémenter: décrémenter les compteurs à chaque vente.

**Q: Peut-on archiver une license sans la supprimer?**
A: Oui, utiliser `isActive: false`. Les licenses inactives n'apparaîtront pas sauf avec `?activeOnly=false`.

**Q: Comment exporter les licenses pour un contrat légal?**
A: Générer un PDF avec tous les paramètres + `additionalTerms` custom. À faire: endpoint `/licenses/:id/pdf`.

---

## ✅ Checklist de Validation

Avant de vendre une license, vérifier:

- ✅ `key` unique
- ✅ Splits totalisent ≤ 100%
- ✅ `title` et `description` clairs
- ✅ Droits cohérents (ex: pas "remix forbidden" + "remix distribution allowed")
- ✅ `creditRequirements` fournis si crédits requis
- ✅ `allowedTerritories` définis
- ✅ `durationMonths` défini si limitation temporelle
- ✅ Testée avec un track avant de l'activer

---

**Dernière révision**: 25 avril 2026
