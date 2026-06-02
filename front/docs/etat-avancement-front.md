# État d’avancement du front

Ce document résume l’état actuel du front EUKS et les points à connaître pour brancher ou terminer le back sans casser l’existant.

## Résumé

Le front est déjà structuré autour de trois parcours principaux:

- le store public avec catalogue, filtres par tags, lecture preview et modale d’achat
- l’authentification avec page de login et logout local
- un dashboard admin avec lecture du catalogue, gestion des tags et prototype de création de track

Le front fonctionne aujourd’hui avec des données réelles pour le catalogue et l’auth, mais plusieurs zones restent encore en prototype ou dépendent d’un contrat backend précis, surtout le checkout PayPal et certaines mutations du dashboard.

## Structure front

- Entrée principale: [src/App.jsx](src/App.jsx)
- Page de login: [src/components/LoginPage.jsx](src/components/LoginPage.jsx)
- Dashboard admin: [src/components/DashboardPage.jsx](src/components/DashboardPage.jsx)
- Modale d’achat: [src/components/PurchaseModal.jsx](src/components/PurchaseModal.jsx)
- Checkout PayPal sandbox: [src/components/PayPalSandboxCheckout.jsx](src/components/PayPalSandboxCheckout.jsx)
- Client catalogue: [src/lib/catalogApi.js](src/lib/catalogApi.js)
- Player audio réactif: [src/hooks/useReactiveAudioPlayer.js](src/hooks/useReactiveAudioPlayer.js)

Le rendu public gère aussi la langue FR/EN, l’état d’auth local, l’ouverture de modales et une navigation simple par `pathname`.

## Ce qui est déjà en place

### Store public

- Chargement du catalogue depuis le back via `GET /api/v1/tags` et `GET /api/v1/tracks`.
- Support d’une réponse simple ou paginée pour les tracks.
- Filtrage des morceaux par combinaison de tags mood + genre.
- Lecture preview avec player réactif, progression, seek et fallback audio local.
- Ouverture de la modale d’achat depuis la liste ou le player.

### Auth

- Login via `POST /api/v1/auth/login`.
- Stockage local de `euks.auth.token` et, si présent, `euks.auth.user`.
- Logout via `POST /api/v1/auth/logout` avec Bearer token.
- Redirection simple vers `/login` et `/dashboard` selon l’état local.

### Dashboard admin

- Chargement des tracks via `GET /api/v1/tracks?page=1&perPage=20`.
- Chargement des clés musicales via `GET /api/v1/musical-keys`.
- Chargement des tags via `GET /api/v1/tags`.
- Création de tag via `POST /api/v1/tags`.
- Suppression de tag via `DELETE /api/v1/tags/:id`.
- Prototype de création de track via `POST /api/v1/tracks` en multipart form-data.

### Checkout PayPal sandbox

- La modale d’achat propose plusieurs licences et n’active le checkout PayPal que pour les licences payables.
- Le front charge un SDK PayPal public côté navigateur.
- Le flow attendu côté UX est: config, création de commande, approval, capture, puis affichage du résultat.

## Contrats attendus par le front

### Auth

Le front s’attend au minimum à:

- `POST /api/v1/auth/login` qui renvoie `token` et idéalement `user`
- `POST /api/v1/auth/logout` accepté avec `Authorization: Bearer <token>`

Le front ne prévoit pas de refresh token ni de session avancée côté client.

### Catalogue

Le front sait consommer deux formes de réponse pour les tracks:

- un tableau brut
- un objet paginé avec `data` et `metadata.lastPage`

Champs utilisés côté UI pour une track:

- `id`
- `title`
- `coverImagePath`
- `audioFilePath`
- `durationSeconds`
- `bpm`
- `priceCents`
- `listenCount`
- `musicalKey`
- `tags` avec `type` attendu sur `mood` ou `genre`

Les médias doivent être réellement servables publiquement, sinon les covers et previews tombent en fallback ou échouent.

### Dashboard admin

Pour la création de track, le front envoie un `FormData` avec les champs suivants:

- `title`
- `bpm`
- `priceCents`
- `musicalKeyId`
- `tagIds[]`
- `cover`
- `previewMp3`
- `previewWav`
- `stemsZip`

Pour les tags, il envoie:

- `name`
- `type`
- `slug` optionnel

### PayPal

Le contrat documenté dans [docs/paypal-front-contract.md](docs/paypal-front-contract.md) n’est pas encore aligné avec le code réel du front.

Le front actuel appelle:

- `GET /api/paypal/config`
- `POST /api/paypal/create-order`
- `POST /api/paypal/capture-order`

Et il attend aujourd’hui:

- dans la config: `configured`, `clientId`, `currencyCode`, `buyerCountry`
- dans la création de commande: au moins `id`
- dans la capture: `id`, `status`, `payer.email_address`, `purchase_units[0].payments.captures[0].id`, `purchase_units[0].payments.captures[0].status`

Le back devra soit exposer ces routes/ces champs, soit on devra corriger le front pour adopter le contrat officiel décrit dans la doc PayPal.

## Limites et points de risque

- Le dashboard admin se base sur l’état local du token et du user; l’UI peut afficher l’accès admin sans validation backend au chargement.
- La page des achats du dashboard est encore une vue factice avec des données de démonstration.
- Le checkout PayPal est le point d’intégration le plus fragile à cause du décalage entre le contrat codé et le contrat documenté.
- Le front dépend d’une exposition correcte des fichiers statiques backend pour les covers et previews audio.
- Le formulaire de création de track est fonctionnel côté UI, mais il reste une intégration backend à stabiliser sur la validation des fichiers et la structure des réponses.

## Ce que le back doit fournir pour que tout soit stable

1. Des réponses catalogue cohérentes, au format brut ou paginé, avec `lastPage` si pagination.
2. Des routes auth stables pour login/logout, avec token Bearer.
3. Des routes tags et tracks compatibles avec les champs envoyés par le dashboard.
4. Une stratégie de diffusion des médias publics pour covers et previews.
5. Un contrat PayPal aligné avec le front ou, inversement, une mise à jour du front pour suivre le contrat officiel.

## Priorité d’intégration

1. Aligner le contrat PayPal entre front et back.
2. Verrouiller la diffusion des médias publics.
3. Stabiliser les réponses du catalogue et des mutations admin.
4. Remplacer les vues factices du dashboard par de vraies données backend.

## Références utiles

- [docs/front-api.md](docs/front-api.md)
- [docs/paypal-front-contract.md](docs/paypal-front-contract.md)
- [src/App.jsx](src/App.jsx)
- [src/lib/catalogApi.js](src/lib/catalogApi.js)
- [src/components/DashboardPage.jsx](src/components/DashboardPage.jsx)
- [src/components/PayPalSandboxCheckout.jsx](src/components/PayPalSandboxCheckout.jsx)
