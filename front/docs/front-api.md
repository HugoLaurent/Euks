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

Un track contient:

- `title`
- `coverImagePath`
- `audioFilePath`
- `durationSeconds`
- `bpm`
- `musicalKeyId`
- `priceCents`
- `listenCount`
- `musicalKey`
- `tags`

Notes metier:

- `priceCents` est en centimes
- `durationSeconds` est en secondes
- `coverImagePath` et `audioFilePath` sont pour l'instant de simples paths/URLs

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
  "coverImagePath": "seed/covers/track-001.jpg",
  "audioFilePath": "seed/audio/track-001.mp3",
  "durationSeconds": 128,
  "bpm": 149,
  "musicalKeyId": 1,
  "priceCents": 1499,
  "listenCount": 320,
  "createdAt": "2026-04-16T10:00:00.000+00:00",
  "updatedAt": "2026-04-16T10:00:00.000+00:00",
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
- `coverImagePath`, `audioFilePath`, `durationSeconds`, `bpm` peuvent etre `null`
- `tagIds` est optionnel

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

## Erreurs utiles pour le front

Codes les plus probables:

- `401` si pas authentifie
- `404` si la ressource n'existe pas
- `409` si conflit de slug ou de nom
- `422` si payload invalide

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
