# PayPal - Contrat Front vers Back

Doc a transmettre au back pour brancher le checkout PayPal utilise par le front.

Cette spec decrit ce que le front attend du back pour un paiement PayPal Standard avec bouton JS SDK et capture serveur.

## Objectif

Permettre au front :

1. de charger le SDK PayPal avec le bon `clientId`
2. de creer une commande via le back
3. de capturer la commande via le back apres validation PayPal
4. d'afficher un etat de succes ou d'erreur fiable

Le front ne doit jamais connaitre le `client secret` PayPal.

## Contexte Front

Le checkout est affiche dans la modale d'achat.

Le flow front actuel est :

1. ouverture de la modale
2. selection d'une licence
3. chargement de la config PayPal
4. chargement du SDK PayPal JS
5. `createOrder` via le back
6. approval dans la popup PayPal
7. `capture` via le back
8. affichage du recap de paiement

Notes metier :

- le front vend des beats numeriques
- pas de livraison physique
- le mode cible est `CAPTURE`
- la licence `exclusive` n'est pas payable via PayPal dans l'UX actuelle, elle reste en mode nego/devis

## Base URL proposee

Le back actuel utilise deja :

```txt
http://localhost:3333/api/v1
```

Les routes PayPal peuvent donc vivre sous :

```txt
/payments/paypal/...
```

## Routes attendues

### 1. `GET /payments/paypal/config`

But :
retourner la configuration publique necessaire au front pour charger le SDK PayPal.

Auth :
publique

Reponse `200` :

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

Reponse `503` si PayPal n'est pas configure :

```json
{
  "enabled": false,
  "message": "PayPal is not configured",
  "missing": ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"]
}
```

Notes :

- `clientId` est public cote front
- `clientSecret` ne doit jamais sortir du back
- `environment` peut valoir `sandbox` ou `live`
- La devise est fournie par `PAYPAL_CURRENCY_CODE`, avec `PAYPAL_CURRENCY` accepte en secours

### 2. `POST /payments/paypal/orders`

But :
creer une commande PayPal a partir d'un track et d'une licence.

Auth :
publique

Body attendu :

```json
{
  "trackId": 12,
  "licenseKey": "premiumPlus",
  "locale": "fr-FR"
}
```

Important :

- le front ne doit pas envoyer le prix final comme source de verite
- le back doit recalculer le montant a partir du `trackId` et de la `licenseKey`
- si le prix est modifie dans le back, c'est le back qui fait foi

Reponse `200` :

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
    "title": "Licence Premium Plus"
  }
}
```

Erreurs possibles :

- `404` si le track n'existe pas
- `409` si la licence n'est pas payable par PayPal
- `422` si `trackId` ou `licenseKey` sont invalides
- `502` ou `503` si PayPal echoue cote serveur

Exemple `409` :

```json
{
  "message": "This license requires a negotiated quote",
  "code": "LICENSE_NOT_PAYABLE"
}
```

### 3. `POST /payments/paypal/orders/:orderId/capture`

But :
capturer la commande PayPal apres approval du buyer.

Auth :
publique

Body minimal :

```json
{}
```

Ou body accepte si le back prefere :

```json
{
  "trackId": 12,
  "licenseKey": "premiumPlus"
}
```

Reponse `200` :

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

Le front a besoin au minimum de retrouver :

- `id` de la commande
- `status`
- `payer.email_address` si disponible
- `purchase_units[0].payments.captures[0].id`
- `purchase_units[0].payments.captures[0].status`

Erreurs possibles :

- `404` si la commande est inconnue
- `409` si deja capturee
- `422` si la commande est dans un etat invalide
- `502` ou `503` si PayPal echoue cote serveur

Exemple d'erreur utile au front :

```json
{
  "message": "PayPal capture failed",
  "details": [
    {
      "issue": "INSTRUMENT_DECLINED",
      "description": "The instrument presented was either declined by the processor or bank, or it cannot be used for this payment."
    }
  ],
  "debug_id": "f4f6c9f0f2f1"
}
```

Important :

- si PayPal renvoie `INSTRUMENT_DECLINED`, le front peut relancer `actions.restart()`
- il faut donc conserver `details[].issue` dans la reponse back si possible

## Contrat d'erreur recommande

Pour toutes les routes PayPal, le front est plus simple a gerer si le back renvoie cette forme :

```json
{
  "message": "Human readable message",
  "code": "OPTIONAL_MACHINE_CODE",
  "details": [],
  "debug_id": "OPTIONAL_PAYPAL_DEBUG_ID"
}
```

Champs importants :

- `message` : texte affichable au front
- `code` : utile pour des cas metier comme `LICENSE_NOT_PAYABLE`
- `details` : utile pour les erreurs PayPal
- `debug_id` : utile pour le debug support

## Regles metier cote back

Le back doit :

1. recalculer le prix depuis ses propres donnees
2. refuser toute licence non payable
3. creer les commandes avec `intent = CAPTURE`
4. marquer l'achat comme digital :
   `shipping_preference = NO_SHIPPING`
5. utiliser PayPal Orders v2 cote serveur
6. enregistrer localement la transaction si un modele de commande existe

Recommandations utiles :

- stocker `trackId`, `licenseKey`, `priceCents`, `paypalOrderId`, `paypalCaptureId`, `payerEmail`, `status`
- utiliser `custom_id` pour embarquer une reference metier interne
- utiliser `reference_id` avec la licence
- utiliser `description` pour quelque chose comme `Moon Tide - Premium Plus License`

## Mapping propose Front -> Back -> PayPal

Payload front :

```json
{
  "trackId": 12,
  "licenseKey": "premiumPlus",
  "locale": "fr-FR"
}
```

Exemple de mapping back vers PayPal Orders v2 :

```json
{
  "intent": "CAPTURE",
  "purchase_units": [
    {
      "reference_id": "premiumPlus",
      "description": "Moon Tide - Premium Plus License",
      "custom_id": "track:12|license:premiumPlus",
      "amount": {
        "currency_code": "EUR",
        "value": "35.00"
      }
    }
  ],
  "payment_source": {
    "paypal": {
      "experience_context": {
        "shipping_preference": "NO_SHIPPING",
        "user_action": "PAY_NOW",
        "locale": "fr-FR"
      }
    }
  }
}
```

## SDK PayPal cote front

Le front charge le SDK avec :

- `client-id`
- `currency`
- `buyer-country`
- `intent=capture`
- `components=buttons`

Le back doit donc fournir assez d'infos via `GET /payments/paypal/config`.

## Webhooks

Non bloquant pour brancher le front.

Mais recommande cote back pour la robustesse :

- `CHECKOUT.ORDER.APPROVED`
- `PAYMENT.CAPTURE.COMPLETED`
- `PAYMENT.CAPTURE.DENIED`
- `PAYMENT.CAPTURE.REFUNDED`

Le front n'en depend pas directement.

## Ce que le front n'attend pas

Le front n'a pas besoin que le back :

- expose le `client secret`
- fasse connecter l'utilisateur EUKS avant paiement
- renvoie toute la reponse PayPal brute si un payload simplifie suffit

Le front a seulement besoin d'un contrat stable et de champs utiles pour l'affichage.

## Version minimale pour avancer vite

Si le back veut faire le minimum utile, il suffit de livrer :

1. `GET /payments/paypal/config`
2. `POST /payments/paypal/orders`
3. `POST /payments/paypal/orders/:orderId/capture`

Avec :

- `trackId`
- `licenseKey`
- `locale`
- reponses JSON stables
- conservation de `details[].issue` sur les erreurs PayPal

## References officielles

Docs officielles PayPal utilisees comme base :

- JS SDK Reference: https://developer.paypal.com/sdk/js/reference/
- Orders API v2: https://developer.paypal.com/api/orders/v2
- Standard Checkout integration: https://developer.paypal.com/studio/checkout/standard/integrate
