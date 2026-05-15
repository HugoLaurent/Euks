# État d'avancement du Backend EUKS

**Date**: 25 avril 2026  
**Stack**: AdonisJS 7 + TypeScript + SQLite (dev) / PostgreSQL (prod)  
**Version API**: v1

---

## 📊 Résumé Général

Le backend est **fonctionnel et prêt pour intégration frontend** avec la majorité des fonctionnalités implémentées. Voici le statut global :

- ✅ **Authentification** : Complétée
- ✅ **Gestion des Tracks** : Complétée
- ✅ **Gestion des Licenses** : Complétée
- ✅ **Gestion des Tags** : Complétée
- ✅ **Gestion des Clés Musicales** : Complétée
- ✅ **Paiements PayPal** : Complétée
- ✅ **Gestion des Profils** : Basique (complétée)
- ⚠️ **Gestion des Comptes** : Pas de route publique d'inscription

---

## 🔐 Authentification

### Système d'authentification
- **Type** : Token Bearer
- **Provider** : Base de données (DbAccessTokensProvider)
- **Modèle** : Utilisateur avec rôles

### Rôles disponibles
```typescript
'admin' | 'owner'  
```

### Endpoints d'auth

#### 1. Login
```
POST /api/v1/auth/login

Body:
{
  "email": "admin@euks.local",
  "password": "Admin12345!"
}

Response (201):
{
  "user": {
    "id": 1,
    "role": "admin",
    "fullName": "Admin",
    "email": "admin@euks.local",
    "createdAt": "2026-04-16T10:00:00.000+00:00",
    "updatedAt": "2026-04-16T10:00:00.000+00:00",
    "initials": "A"
  },
  "token": "oat_xxxxxxxxxxxx"
}
```

#### 2. Logout
```
POST /api/v1/auth/logout
Headers: Authorization: Bearer <token>

Response (200):
{
  "message": "Logged out successfully"
}
```

#### 3. Profil utilisateur
```
GET /api/v1/account/profile
Headers: Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "role": "admin",
  "fullName": "Admin",
  "email": "admin@euks.local",
  "createdAt": "2026-04-16T10:00:00.000+00:00",
  "updatedAt": "2026-04-16T10:00:00.000+00:00",
  "initials": "A"
}
```

### Comptes de développement
```
Email: admin@euks.local
Mot de passe: Admin12345!
Rôle: admin

---

Email: owner@euks.local
Mot de passe: Owner12345!
Rôle: owner
```

**Note** : Ces comptes système sont créés automatiquement au premier login s'ils n'existent pas.

---

## 🎵 Gestion des Tracks

### État : ✅ Complétée

Tous les endpoints CRUD sont implémentés avec support complet pour :
- Pagination
- Filtrage par clé musicale, tags, recherche
- Relations (licenses, tags, clé musicale)
- Upload de fichiers

### Endpoints

#### Listing et consultation (public)
```
GET /api/v1/tracks
Query parameters:
  - page (default: 1)
  - perPage (default: 12, max: 100)
  - musicalKeyId (optionnel)
  - tagId (optionnel)
  - tagType (optionnel: 'mood' | 'genre')
  - tagSlug (optionnel)
  - search (optionnel)

Response (200):
{
  "data": [
    {
      "id": 1,
      "title": "Mmmbop Mix",
      "coverImagePath": "seed/covers/track-001.jpg",
      "audioFilePath": "seed/audio/track-001.mp3",
      "durationSeconds": 128,
      "bpm": 149,
      "musicalKeyId": 1,
      "priceCents": 1499,
      "listenCount": 320,
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00",
      "licenses": [...],
      "musicalKey": {...},
      "tags": [...]
    }
  ],
  "metadata": {
    "total": 36,
    "perPage": 12,
    "currentPage": 1,
    "lastPage": 3,
    "firstPage": 1,
    "firstPageUrl": "/?page=1",
    "lastPageUrl": "/?page=3",
    "nextPageUrl": "/?page=2",
    "previousPageUrl": null
  }
}
```

#### Détails d'un track
```
GET /api/v1/tracks/:id

Response (200):
{
  "id": 1,
  "title": "Mmmbop Mix",
  "coverImagePath": "...",
  "audioFilePath": "...",
  "waveFilePath": "...",
  "zipFilePath": "...",
  "durationSeconds": 128,
  "bpm": 149,
  "musicalKeyId": 1,
  "priceCents": 1499,
  "listenCount": 320,
  "createdAt": "2026-04-16T10:00:00.000+00:00",
  "updatedAt": "2026-04-16T10:00:00.000+00:00",
  "licenses": [...],
  "musicalKey": {...},
  "tags": [...]
}
```

#### Créer un track (admin/owner)
```
POST /api/v1/tracks
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields:
  - title (string, requis)
  - coverImage (file, optionnel)
  - audioFile (file, optionnel)
  - waveFile (file, optionnel)
  - zipFile (file, optionnel)
  - durationSeconds (number, optionnel)
  - bpm (number, optionnel)
  - musicalKeyId (number, optionnel)
  - priceCents (number, default: 0)
  - tagIds (array<number>, optionnel)

Response (201): Track créé
```

#### Modifier un track
```
PATCH /api/v1/tracks/:id
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Fields: Identiques au POST (tous optionnels)

Response (200): Track modifié
```

#### Supprimer un track
```
DELETE /api/v1/tracks/:id
Headers: Authorization: Bearer <token>

Response (204): No Content
```

---

## 🎫 Gestion des Licenses (AVANCÉE)

### État : ✅ Complétée et Très Étendue

Système de licensing extrêmement flexible avec 100+ paramètres configurables. Support complet pour :
- Multiple formats audio (MP3, WAV, FLAC, AIFF, AAC, OGG)
- Séparation des pistes (stems, instrumentals, acapella)
- Plafonds de distribution (streams, downloads, sales)
- Restrictions vidéo par plateforme
- 11 catégories de droits d'usage (remix, live, radio, TV, sampling, etc.)
- Commercialité avec plafonds revenue
- Territoire et durée configurables
- Transfert et sous-licence
- Attribution avec splits de revenue (master/publishing/tiers)
- Restrictions techniques (bitrate, DRM, concurrent streams)
- Restrictions par usage (nonprofit, education, politique, military, gambling, etc.)
- Versioning et audit
- Templates réutilisables

**Documentation détaillée** : Voir [docs/ADVANCED_LICENSES.md](docs/ADVANCED_LICENSES.md)

### Endpoints

#### Lister les licences (public)
```
GET /api/v1/licenses
Query parameters:
  - activeOnly (default: true)
  - paypalOnly (default: false)
  - isTemplate (optionnel: filter par template)
  - templateCategory (optionnel: 'standard' | 'premium' | 'exclusive' | 'custom')

Response (200):
[
  {
    "id": 1,
    "key": "basic",
    "title": "Basic License",
    "description": "Entry-level license...",
    "isActive": true,
    "isTemplate": true,
    "templateCategory": "standard",
    "isPaypalEnabled": true,
    "sortOrder": 10,
    
    // === AUDIO ===
    "audioFormats": ["mp3"],
    "trackSeparation": "full_mix",
    
    // === DISTRIBUTION LIMITS ===
    "maxStreams": 100000,
    "maxDownloads": 1000,
    "maxSales": null,
    
    // === VIDEO ===
    "allowVideoClips": true,
    "videoClipsLimit": 1,
    "allowedPlatforms": ["tiktok", "instagram", "youtube"],
    
    // === USAGE RIGHTS (11 fields) ===
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
    
    // === COMMERCIAL ===
    "isExclusive": false,
    "allowCommercialUse": true,
    "commercialUseLimit": "limited",
    "commercialUseDescription": "For personal & small business use only...",
    
    // === TERRITORY & DURATION ===
    "allowedTerritories": ["WORLDWIDE"],
    "durationMonths": null,
    "licenseStartDate": null,
    "licenseEndDate": null,
    
    // === TRANSFER ===
    "allowTransfer": false,
    "allowSublicense": false,
    "transferRestrictions": null,
    
    // === ATTRIBUTION & SPLITS ===
    "requireMasterCredit": true,
    "requirePublishingCredit": true,
    "requireArtistCredit": true,
    "creditRequirements": "[Artist] - [Track] (euks.io)",
    "masterSplitPercentage": 0,
    "publishingSplitPercentage": 0,
    "thirdPartySplitPercentage": 0,
    
    // === TECHNICAL ===
    "minAudioBitrate": "128",
    "requireDrmEncryption": false,
    "allowOfflineListening": false,
    "maxConcurrentStreams": null,
    
    // === MODIFICATIONS ===
    "allowTrackModification": false,
    "requireApprovalForModification": false,
    "modificationRestrictions": null,
    
    // === RESTRICTED USES (7 fields) ===
    "allowNonprofitUse": true,
    "allowEducationalUse": true,
    "allowReligiousUse": true,
    "allowPoliticalUse": false,
    "allowAdultContent": true,
    "allowGamblingUse": false,
    "allowMilitaryUse": false,
    
    // === RESTRICTIONS ===
    "restrictedGenres": null,
    "restrictedUseCases": null,
    "additionalTerms": "Suitable for TikTok, Instagram...",
    "requiresWrittenAgreement": false,
    
    // === VERSIONING ===
    "revisionDate": null,
    "revisionNotes": null,
    
    "createdAt": "2026-04-16T10:00:00.000+00:00",
    "updatedAt": "2026-04-16T10:00:00.000+00:00"
  }
]
```

#### Détails d'une licence
```
GET /api/v1/licenses/:id

Response (200): Licence unique
```

#### Créer une licence (admin/owner)
```
POST /api/v1/licenses
Headers: Authorization: Bearer <token>

Body:
{
  "key": "basic",
  "title": "Basic License",
  "description": "Optional description",
  "isPaypalEnabled": true,
  "isActive": true,
  "sortOrder": 10
}

Response (201): Licence créée
```

#### Modifier une licence
```
PATCH /api/v1/licenses/:id
Headers: Authorization: Bearer <token>

Body: Identique au POST (tous optionnels)

Response (200): Licence modifiée
```

#### Supprimer une licence
```
DELETE /api/v1/licenses/:id
Headers: Authorization: Bearer <token>

Response (204): No Content
```

---

## 🏷️ Gestion des Tags

### État : ✅ Complétée

Deux types de tags : `mood` et `genre`. Support complet avec slugification automatique.

### Endpoints

#### Lister les tags (public)
```
GET /api/v1/tags
Query parameters:
  - type (optionnel: 'mood' | 'genre')

Response (200):
[
  {
    "id": 1,
    "name": "Happy",
    "slug": "happy",
    "type": "mood",
    "createdAt": "2026-04-16T10:00:00.000+00:00",
    "updatedAt": "2026-04-16T10:00:00.000+00:00"
  }
]
```

#### Détails d'un tag
```
GET /api/v1/tags/:id

Response (200): Tag unique
```

#### Créer un tag (admin/owner)
```
POST /api/v1/tags
Headers: Authorization: Bearer <token>

Body:
{
  "name": "Happy",
  "slug": "happy",  // optionnel, auto-généré si absent
  "type": "mood"    // 'mood' | 'genre'
}

Response (201): Tag créé
```

#### Modifier un tag
```
PATCH /api/v1/tags/:id
Headers: Authorization: Bearer <token>

Body: Identique au POST (tous optionnels)

Response (200): Tag modifié
```

#### Supprimer un tag
```
DELETE /api/v1/tags/:id
Headers: Authorization: Bearer <token>

Response (204): No Content
```

---

## 🎼 Gestion des Clés Musicales

### État : ✅ Complétée

Gestion des clés musicales (C Major, D Minor, etc.).

### Endpoints

#### Lister les clés musicales (public)
```
GET /api/v1/musical-keys

Response (200):
[
  {
    "id": 1,
    "name": "C Major",
    "slug": "c-major",
    "createdAt": "2026-04-16T10:00:00.000+00:00",
    "updatedAt": "2026-04-16T10:00:00.000+00:00"
  }
]
```

#### Détails d'une clé musicale
```
GET /api/v1/musical-keys/:id

Response (200): Clé unique
```

#### Créer une clé musicale (admin/owner)
```
POST /api/v1/musical-keys
Headers: Authorization: Bearer <token>

Body:
{
  "name": "C Major",
  "slug": "c-major"  // optionnel
}

Response (201): Clé créée
```

#### Modifier une clé musicale
```
PATCH /api/v1/musical-keys/:id
Headers: Authorization: Bearer <token>

Body: Identique au POST (tous optionnels)

Response (200): Clé modifiée
```

#### Supprimer une clé musicale
```
DELETE /api/v1/musical-keys/:id
Headers: Authorization: Bearer <token>

Response (204): No Content
```

---

## 🔗 Gestion des Licenses par Track

### État : ✅ Complétée

Associer/dissocier des licenses à un track avec prix personnalisé par licence.

### Endpoints

#### Voir les licenses d'un track
```
GET /api/v1/tracks/:id/licenses
Headers: Authorization: Bearer <token>

Response (200):
{
  "track": {
    "id": 1,
    "title": "Mmmbop Mix"
  },
  "licenses": [
    {
      "id": 1,
      "key": "basic",
      "title": "Basic License",
      "description": "...",
      "isPaypalEnabled": true,
      "isActive": true,
      "sortOrder": 10,
      "priceCents": 1500,
      "isTrackActive": true,
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00"
    }
  ]
}
```

#### Synchroniser les licenses d'un track
```
PUT /api/v1/tracks/:id/licenses
Headers: Authorization: Bearer <token>

Body:
{
  "licenses": [
    {
      "licenseId": 1,
      "priceCents": 1500,
      "isActive": true
    },
    {
      "licenseId": 3,
      "priceCents": 3700,
      "isActive": true
    }
  ]
}

Response (200): Licenses synchronisées
```

---

## 💳 Paiements PayPal

### État : ✅ Complétée

Intégration complète de PayPal pour les achats de licenses. Support pour sandbox et live.

### Configuration requise

Variables d'environnement :
```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=sandbox  # ou 'live'
PAYPAL_CURRENCY_CODE=USD
PAYPAL_BUYER_COUNTRY=US
PAYPAL_INTENT=CAPTURE
```

### Endpoints

#### Configuration PayPal publique
```
GET /api/v1/payments/paypal/config

Response (200):
{
  "enabled": true,
  "environment": "sandbox",
  "clientId": "your_client_id",
  "currencyCode": "USD",
  "buyerCountry": "US",
  "intent": "CAPTURE"
}

Response (503) si non configuré:
{
  "enabled": false,
  "message": "PayPal is not configured",
  "missing": ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"]
}
```

#### Créer une commande PayPal
```
POST /api/v1/payments/paypal/orders

Body:
{
  "trackId": 1,
  "licenseKey": "basic"
}

Response (201):
{
  "id": "5O190127162828816",
  "status": "CREATED",
  "links": [...]
}

Erreurs possibles:
- 404 : Track non trouvé
- 422 : Licence invalide ou indisponible
- 503 : PayPal non configuré
```

#### Capturer une commande PayPal
```
POST /api/v1/payments/paypal/orders/:orderId/capture

Body:
{
  "payerEmail": "buyer@example.com"
}

Response (200):
{
  "status": "COMPLETED",
  "captureId": "...",
  "message": "Payment captured successfully"
}

Erreurs possibles:
- 404 : Commande non trouvée
- 409 : Commande pas en état APPROVED
- 422 : Erreur PayPal
- 503 : PayPal non configuré
```

### Flow d'achat complet

1. Frontend : `POST /payments/paypal/config` → récupère config et clientId
2. Frontend : Affiche bouton PayPal avec clientId
3. Utilisateur : Clique sur bouton PayPal, login/approuve
4. Frontend : `POST /payments/paypal/orders` → créé la commande
5. Frontend : Envoie orderId à PayPal pour approbation
6. Frontend : `POST /payments/paypal/orders/:orderId/capture` → finalise
7. Backend : Sauvegarde la transaction

---

## 🗄️ Modèle de Base de Données

### Tables principales

#### Users
```sql
- id (PK)
- email (unique)
- full_name
- password (hash)
- role (admin | owner)
- created_at
- updated_at
```

#### Tracks
```sql
- id (PK)
- title
- cover_image_path
- audio_file_path
- wave_file_path
- zip_file_path
- duration_seconds
- bpm
- musical_key_id (FK)
- price_cents
- listen_count
- created_at
- updated_at
```

#### Licenses
```sql
- id (PK)
- key (unique)
- title
- description
- is_paypal_enabled
- is_active
- sort_order
- created_at
- updated_at
```

#### Tags
```sql
- id (PK)
- name
- slug (unique par type)
- type (mood | genre)
- created_at
- updated_at
```

#### MusicalKeys
```sql
- id (PK)
- name
- slug (unique)
- created_at
- updated_at
```

#### TrackLicenses (pivot)
```sql
- track_id (FK)
- license_id (FK)
- price_cents
- is_active
- created_at
- updated_at
```

#### TrackTags (pivot)
```sql
- track_id (FK)
- tag_id (FK)
- created_at
- updated_at
```

#### PaymentOrders
```sql
- id (PK)
- provider (paypal)
- track_id (FK, nullable)
- license_id (FK, nullable)
- track_title_snapshot
- license_key_snapshot
- license_title_snapshot
- amount_cents
- currency_code
- status (CREATING | CREATED | APPROVED | COMPLETED | FAILED | VOIDED)
- paypal_order_id
- paypal_capture_id
- created_at
- updated_at
```

#### AccessTokens
```sql
- id (PK)
- tokenable_id (FK to Users)
- type
- token (hash unique)
- abilities
- last_used_at
- created_at
- updated_at
```

---

## 📦 Data Seeders

Le projet inclut des seeders pour peupler la base de développement :

```bash
npm run db:seed
```

Crée automatiquement :
- 2 utilisateurs système (admin, owner)
- 12 clés musicales
- Tags (mood et genre)
- 36 tracks d'exemple
- Licenses associées aux tracks
- PaymentOrders d'exemple

---

## 🚀 Déploiement et Développement

### Mode développement
```bash
npm run dev
```
Accessible sur : `http://localhost:3333`

### Build production
```bash
npm run build
```

### Démarrer en production
```bash
npm start
```

### Docker (PostgreSQL)
```bash
npm run db:up      # Démarre PostgreSQL
npm run db:down    # Arrête PostgreSQL
```

### Tests
```bash
npm test
```

### Validation du code
```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run format     # Prettier
```

---

## 📋 Points d'intégration pour le Frontend

### 1. Configuration API
```javascript
const API_BASE = 'http://localhost:3333/api/v1'
const AUTH_TOKEN_KEY = 'auth_token'
```

### 2. Headers requis pour requêtes authentifiées
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 3. Gestion des erreurs courants

```javascript
// 401 Unauthorized → Token expiré, rediriger login
// 403 Forbidden → Permissions insuffisantes
// 404 Not Found → Ressource supprimée
// 422 Unprocessable Entity → Validation error
// 503 Service Unavailable → PayPal non configuré
```

### 4. Pagination des tracks
- Toujours paginer : `?page=1&perPage=12`
- Total disponible dans `metadata.total`
- Navigation avec `nextPageUrl`, `previousPageUrl`

### 5. Upload de fichiers
Utiliser `multipart/form-data` pour POST/PATCH sur `/tracks`

### 6. Détails complets des relations
Chaque track retourné inclut :
- `licenses` : Les licenses actives avec prix par track
- `tags` : Tags attachés
- `musicalKey` : Clé musicale associée

---

## ⚠️ Limitations et À Savoir

### Actuellement NON implémentés

- ❌ Inscription publique (route `/register`)
- ❌ Récupération de mot de passe
- ❌ Modification du profil utilisateur
- ❌ Pagination au-delà de 100 items par page
- ❌ Filtering avancé (plages de prix, durée, BPM)
- ❌ Favoris / Wishlist
- ❌ Historique d'achats
- ❌ Système de notifications
- ❌ Analytics détaillées

### Restrictions

- Les uploads de fichiers max : 50MB (configurable)
- Les tags peuvent être filtrés par type : `mood` ou `genre`
- Les recherche de tracks : case-insensitive sur le titre
- Les slugs : auto-générés et uniques par type pour tags
- Les clés musicales : 12 par défaut (setup initial)

### Performance

- Pagination max 100 items/page
- Les relations sont incluses dans les réponses (pas de N+1)
- Cache : À implémenter au niveau frontend pour les licenses et clés

---

## 📞 Support et Debugging

### Logs
```bash
# Affichage des logs formatés en dev
npm run dev
```

### Base de données en dev
```bash
# SQLite - fichier : tmp/db.sqlite3
# Seed données initiales : npm run db:seed
```

### Tokens d'accès
- Format : `oat_` prefix
- Expiration : À configurer via `@adonisjs/auth`
- Invalider avec : `POST /auth/logout`

---

## 📝 Prochaines étapes recommandées

1. **Frontend** : Implémenter pages login/profile
2. **Frontend** : Créer catégorie browse tracks avec filtres
3. **Frontend** : Implémenter panier et checkout PayPal
4. **Backend** : Ajouter endpoint d'inscription (avec validation email)
5. **Backend** : Historique d'achats utilisateur
6. **Frontend** : Dashboard admin (CRUD des contenus)
7. **Backend** : Rate limiting et throttling

---

## 📚 Documentation supplémentaire

- **Stack** : AdonisJS 7.3.1 + Lucid ORM + Vine Validator
- **DB** : SQLite (dev) / PostgreSQL (prod)
- **Auth** : Bearer tokens via @adonisjs/auth
- **Validation** : Vine schema validator
- **File handling** : AdonisJS body parser + file upload
- **API docs** : Plus de détails dans `/docs/front-api.md`

---

**Dernière mise à jour** : 25 avril 2026  
**Status général** : ✅ Production ready pour intégration
