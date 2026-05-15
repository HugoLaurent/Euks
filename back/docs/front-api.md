# API Front

Mini doc pour brancher le front sur le back actuel.

## Base URL

En local:

```txt
http://localhost:3333/api/v1
```

## Auth

Le back utilise un token Bearer.

Flow:

1. `POST /auth/login`
2. Recuperer `token`
3. Envoyer `Authorization: Bearer <token>` sur les routes protegees
4. `POST /auth/logout` pour invalider le token courant

Il n'y a pas de route d'inscription publique.

## Comptes de dev

Si les comptes systeme par defaut sont encore actifs en local:

```txt
admin@euks.local / Admin12345!
owner@euks.local / Owner12345!
```

## Format des reponses

Reponses simples:

- un objet seul est renvoye brut
- une liste simple est renvoyee comme un tableau
- la liste paginee des tracks renvoie un objet avec `data` et `metadata`
- un track inclut maintenant ses `licenses` actives

Exemple de pagination pour `GET /tracks`:

```json
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
      "licenses": [
        {
          "id": 1,
          "key": "basic",
          "title": "Basic License",
          "description": "Entry-level license for demos, socials and light commercial use.",
          "isPaypalEnabled": true,
          "isActive": true,
          "sortOrder": 10,
          "createdAt": "2026-04-16T10:00:00.000+00:00",
          "updatedAt": "2026-04-16T10:00:00.000+00:00",
          "priceCents": 1500,
          "isTrackActive": true
        },
        {
          "id": 3,
          "key": "premiumPlus",
          "title": "Premium Plus License",
          "description": "High-tier license for professional releases and stronger monetization.",
          "isPaypalEnabled": true,
          "isActive": true,
          "sortOrder": 30,
          "createdAt": "2026-04-16T10:00:00.000+00:00",
          "updatedAt": "2026-04-16T10:00:00.000+00:00",
          "priceCents": 3700,
          "isTrackActive": true
        }
      ],
      "musicalKey": {
        "id": 1,
        "name": "C Major",
        "slug": "c-major",
        "createdAt": "2026-04-16T10:00:00.000+00:00",
        "updatedAt": "2026-04-16T10:00:00.000+00:00"
      },
      "tags": [
        {
          "id": 2,
          "name": "Happy",
          "slug": "happy",
          "type": "mood",
          "createdAt": "2026-04-16T10:00:00.000+00:00",
          "updatedAt": "2026-04-16T10:00:00.000+00:00"
        }
      ]
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

## Auth endpoints

### `POST /auth/login`

Body:

```json
{
  "email": "admin@euks.local",
  "password": "Admin12345!"
}
```

Reponse:

```json
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
  "token": "..."
}
```

### `POST /auth/logout`

Headers:

```txt
Authorization: Bearer <token>
```

Reponse:

```json
{
  "message": "Logged out successfully"
}
```

### `GET /account/profile`

Headers:

```txt
Authorization: Bearer <token>
```

Reponse:

```json
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

## Tags

Deux types de tags existent:

- `mood`
- `genre`

### `GET /tags`

Query params optionnels:

- `type=mood`
- `type=genre`

Reponse:

```json
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

### `GET /tags/:id`

Reponse: meme shape qu'un item de la liste.

### `POST /tags`

Protegee par auth.

Body:

```json
{
  "name": "Epic",
  "type": "mood",
  "slug": "epic"
}
```

Notes:

- `slug` est optionnel
- si absent, il est genere depuis `name`

### `PATCH /tags/:id`

Protegee par auth.

Body partiel accepte.

Exemple:

```json
{
  "name": "Very Epic"
}
```

### `DELETE /tags/:id`

Protegee par auth.

## Licenses

Une licence contient:

- `key`
- `title`
- `description`
- `isPaypalEnabled`
- `isActive`
- `sortOrder`

Quand une licence est chargee depuis un track, elle contient aussi:

- `priceCents`
- `isTrackActive`

### `GET /licenses`

Query params optionnels:

- `activeOnly=true|false`
- `paypalOnly=true|false`

Par defaut:

- `activeOnly=true`
- `paypalOnly=false`

Reponse:

```json
[
  {
    "id": 1,
    "key": "basic",
    "title": "Basic License",
    "description": "Entry-level license for demos, socials and light commercial use.",
    "isPaypalEnabled": true,
    "isActive": true,
    "sortOrder": 10,
    "createdAt": "2026-04-16T10:00:00.000+00:00",
    "updatedAt": "2026-04-16T10:00:00.000+00:00"
  },
  {
    "id": 5,
    "key": "exclusive",
    "title": "Exclusive Rights",
    "description": "Exclusive purchase handled manually through quote and negotiation.",
    "isPaypalEnabled": false,
    "isActive": true,
    "sortOrder": 50,
    "createdAt": "2026-04-16T10:00:00.000+00:00",
    "updatedAt": "2026-04-16T10:00:00.000+00:00"
  }
]
```

### `GET /licenses/:id`

Reponse: meme shape qu'un item de la liste.

### `POST /licenses`

Protegee par auth.

Body:

```json
{
  "key": "premiumPlus",
  "title": "Premium Plus License",
  "description": "High-tier license for professional releases.",
  "isPaypalEnabled": true,
  "isActive": true,
  "sortOrder": 30
}
```

### `PATCH /licenses/:id`

Protegee par auth.

Body partiel accepte.

### `DELETE /licenses/:id`

Protegee par auth.

## Musical Keys

### `GET /musical-keys`

Reponse:

```json
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

### `GET /musical-keys/:id`

Reponse: meme shape qu'un item de la liste.

### `POST /musical-keys`

Protegee par auth.

Body:

```json
{
  "name": "D Minor",
  "slug": "d-minor"
}
```

Notes:

- `slug` est optionnel
- si absent, il est genere depuis `name`

### `PATCH /musical-keys/:id`

Protegee par auth.

Body partiel accepte.

### `DELETE /musical-keys/:id`

Protegee par auth.

## Tracks

Le front ajoute les tracks manuellement via ce contrat.

Un track contient:

- `title`
- `coverImagePath`
- `audioFilePath`
- `waveFilePath`
- `zipFilePath`
- `durationSeconds`
- `bpm`
- `musicalKeyId`
- `priceCents`
- `listenCount`
- `licenses`
- `musicalKey`
- `tags`

Notes metier:

- `priceCents` est en centimes
- `durationSeconds` est en secondes
- `coverImagePath`, `audioFilePath`, `waveFilePath` et `zipFilePath` sont pour l'instant de simples paths/URLs
- `audioFilePath` pointe vers le mp3 de pre-ecoute utilise par le front
- `waveFilePath` pointe vers le wav source
- `zipFilePath` pointe vers l'archive piste par piste
- `licenses` est la vraie source de verite pour les prix de checkout

### `GET /tracks`

Query params optionnels:

- `page`
- `perPage`
- `search`
- `musicalKeyId`
- `tagId`
- `tagType`
- `tagSlug`

Exemples:

```txt
GET /tracks?page=1&perPage=12
GET /tracks?search=love
GET /tracks?tagType=mood&tagSlug=happy
GET /tracks?musicalKeyId=3
```

### `GET /tracks/:id`

Reponse:

```json
{
  "id": 1,
  "title": "Mmmbop Mix",
  "coverImagePath": "/uploads/covers/mmmbop-mix.jpg",
  "audioFilePath": "/uploads/audio/mmmbop-mix-preview.mp3",
  "waveFilePath": "/uploads/audio/mmmbop-mix.wav",
  "zipFilePath": "/uploads/archives/mmmbop-mix-stems.zip",
  "durationSeconds": 128,
  "bpm": 149,
  "musicalKeyId": 1,
  "priceCents": 1499,
  "listenCount": 320,
  "createdAt": "2026-04-16T10:00:00.000+00:00",
  "updatedAt": "2026-04-16T10:00:00.000+00:00",
  "licenses": [
    {
      "id": 1,
      "key": "basic",
      "title": "Basic License",
      "description": "Entry-level license for demos, socials and light commercial use.",
      "isPaypalEnabled": true,
      "isActive": true,
      "sortOrder": 10,
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00",
      "priceCents": 1500,
      "isTrackActive": true
    },
    {
      "id": 3,
      "key": "premiumPlus",
      "title": "Premium Plus License",
      "description": "High-tier license for professional releases and stronger monetization.",
      "isPaypalEnabled": true,
      "isActive": true,
      "sortOrder": 30,
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00",
      "priceCents": 3700,
      "isTrackActive": true
    },
    {
      "id": 5,
      "key": "exclusive",
      "title": "Exclusive Rights",
      "description": "Exclusive purchase handled manually through quote and negotiation.",
      "isPaypalEnabled": false,
      "isActive": true,
      "sortOrder": 50,
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00",
      "priceCents": 15000,
      "isTrackActive": true
    }
  ],
  "musicalKey": {
    "id": 1,
    "name": "C Major",
    "slug": "c-major",
    "createdAt": "2026-04-16T10:00:00.000+00:00",
    "updatedAt": "2026-04-16T10:00:00.000+00:00"
  },
  "tags": [
    {
      "id": 2,
      "name": "Happy",
      "slug": "happy",
      "type": "mood",
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00"
    },
    {
      "id": 8,
      "name": "Pop",
      "slug": "pop",
      "type": "genre",
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00"
    }
  ]
}
```

### `POST /tracks`

Protegee par auth.

Body:

```json
{
  "title": "New Track",
  "coverImagePath": "/uploads/covers/new-track.jpg",
  "audioFilePath": "/uploads/audio/new-track.mp3",
  "waveFilePath": "/uploads/audio/new-track.wav",
  "zipFilePath": "/uploads/archives/new-track.zip",
  "durationSeconds": 145,
  "bpm": 124,
  "musicalKeyId": 3,
  "priceCents": 1999,
  "listenCount": 0,
  "tagIds": [1, 8]
}
```

Notes:

- `title` et `priceCents` sont requis
- `listenCount` est optionnel et vaut `0` par defaut
- `musicalKeyId` peut etre `null`
- a la creation, `coverImagePath`, `audioFilePath`, `waveFilePath` et `zipFilePath` doivent etre fournis via fichier ou chemin
- `coverImagePath`, `audioFilePath`, `waveFilePath`, `zipFilePath`, `durationSeconds`, `bpm` peuvent etre `null`
- `audioFilePath` doit contenir le mp3 de pre-ecoute
- `waveFilePath` doit contenir le wav source
- `zipFilePath` doit contenir l'archive piste par piste
- `tagIds` est optionnel

Le front peut aussi envoyer ces fichiers en `multipart/form-data` avec les champs:

- `coverImage` pour l'image de couverture
- `previewAudio` pour le mp3 de pre-ecoute
- `waveFile` pour le fichier wav
- `zipFile` pour l'archive piste par piste

Alias acceptes pour compatibilite front:

- `cover` au lieu de `coverImage`
- `previewMp3` au lieu de `previewAudio`
- `previewWav` au lieu de `waveFile`
- `stemsZip` au lieu de `zipFile`

### `PATCH /tracks/:id`

Protegee par auth.

Body partiel accepte.

Exemples:

```json
{
  "priceCents": 2499
}
```

```json
{
  "tagIds": [2, 9, 12]
}
```

Pour vider les tags:

```json
{
  "tagIds": []
}
```

### `DELETE /tracks/:id`

Protegee par auth.

### `GET /tracks/:id/licenses`

Protegee par auth.

Permet de recuperer toute la config licence d'un track, avec les prix du pivot.

Reponse:

```json
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
      "description": "Entry-level license for demos, socials and light commercial use.",
      "isPaypalEnabled": true,
      "isActive": true,
      "sortOrder": 10,
      "createdAt": "2026-04-16T10:00:00.000+00:00",
      "updatedAt": "2026-04-16T10:00:00.000+00:00",
      "priceCents": 1500,
      "isTrackActive": true
    }
  ]
}
```

### `PUT /tracks/:id/licenses`

Protegee par auth.

Body:

```json
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
    },
    {
      "licenseId": 5,
      "priceCents": 15000,
      "isActive": true
    }
  ]
}
```

## Payments / PayPal

Le checkout PayPal est public cote API.

Le prix est toujours recalcule cote back depuis:

- `trackId`
- `licenseKey`

Le front ne doit jamais envoyer un prix comme source de verite.

### `GET /payments/paypal/config`

Reponse `200` si PayPal est configure:

```json
{
  "enabled": true,
  "environment": "sandbox",
  "clientId": "PAYPAL_SANDBOX_CLIENT_ID",
  "currencyCode": "EUR",
  "buyerCountry": "FR",
  "intent": "capture"
}
```

Reponse `503` si PayPal n'est pas configure:

```json
{
  "enabled": false,
  "message": "PayPal is not configured",
  "missing": ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"]
}
```

### `POST /payments/paypal/orders`

Body:

```json
{
  "trackId": 12,
  "licenseKey": "premiumPlus",
  "locale": "fr-FR"
}
```

Reponse `200`:

```json
{
  "id": "5O190127TN364715T",
  "status": "CREATED",
  "amount": {
    "currencyCode": "EUR",
    "value": "35.00"
  },
  "track": {
    "id": 12,
    "title": "Moon Tide"
  },
  "license": {
    "key": "premiumPlus",
    "title": "Premium Plus License"
  }
}
```

Erreurs metier utiles:

- `404` `TRACK_NOT_FOUND`
- `422` `LICENSE_INVALID`
- `409` `LICENSE_NOT_PAYABLE`
- `409` `LICENSE_NOT_AVAILABLE`
- `502` ou `503` si PayPal echoue cote serveur

### `POST /payments/paypal/orders/:orderId/capture`

Body minimal accepte:

```json
{}
```

Body optionnel accepte aussi:

```json
{
  "trackId": 12,
  "licenseKey": "premiumPlus"
}
```

Reponse `200`:

```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "payer": {
    "email_address": "buyer@personal.example.com"
  },
  "purchase_units": [
    {
      "reference_id": "premiumPlus",
      "payments": {
        "captures": [
          {
            "id": "3GG279541U471931P",
            "status": "COMPLETED",
            "amount": {
              "currency_code": "EUR",
              "value": "35.00"
            }
          }
        ]
      }
    }
  ]
}
```

Erreurs metier utiles:

- `404` `ORDER_NOT_FOUND`
- `409` `ORDER_ALREADY_CAPTURED`
- `409` `ORDER_TRACK_MISMATCH`
- `409` `ORDER_LICENSE_MISMATCH`
- `422` ou autre erreur client PayPal utile au restart checkout
- `502` ou `503` si PayPal echoue cote serveur

## Erreurs utiles pour le front

Codes les plus probables:

- `401` si pas authentifie
- `404` si la ressource n'existe pas
- `409` si conflit de slug ou de nom
- `422` si payload invalide
- `502` si PayPal echoue cote serveur
- `503` si une integration externe n'est pas configuree

Exemple de `422`:

```json
{
  "message": "Unknown tag ids: 999",
  "errors": [
    {
      "field": "tagIds",
      "message": "Unknown tag ids: 999"
    }
  ]
}
```

## Points a garder en tete

- Pas d'inscription publique
- Seuls les users systeme peuvent se connecter
- Pour l'instant il n'y a pas encore d'upload fichier natif
- Le front peut deja travailler avec les seeders Faker
- Le checkout PayPal depend de `PAYPAL_CLIENT_ID` et `PAYPAL_CLIENT_SECRET`
- La devise lit `PAYPAL_CURRENCY_CODE`, avec `PAYPAL_CURRENCY` accepte comme alias de compatibilite
