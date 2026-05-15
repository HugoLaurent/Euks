/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AccessTokenController = () => import('#controllers/access_token_controller')
const LicensesController = () => import('#controllers/licenses_controller')
const MusicalKeysController = () => import('#controllers/musical_keys_controller')
const PaypalPaymentsController = () => import('#controllers/paypal_payments_controller')
const ProfileController = () => import('#controllers/profile_controller')
const TagsController = () => import('#controllers/tags_controller')
const TrackLicensesController = () => import('#controllers/track_licenses_controller')
const TracksController = () => import('#controllers/tracks_controller')

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('login', [AccessTokenController, 'store'])
        router.post('logout', [AccessTokenController, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [ProfileController, 'show'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('licenses', [LicensesController, 'index'])
        router.get('licenses/:id', [LicensesController, 'show'])
        router.get('tags', [TagsController, 'index'])
        router.get('tags/:id', [TagsController, 'show'])
        router.get('musical-keys', [MusicalKeysController, 'index'])
        router.get('musical-keys/:id', [MusicalKeysController, 'show'])
        router.get('tracks', [TracksController, 'index'])
        router.get('tracks/:id', [TracksController, 'show'])
        router.get('payments/paypal/config', [PaypalPaymentsController, 'config'])
        router.post('payments/paypal/orders', [PaypalPaymentsController, 'createOrder'])
        router.post('payments/paypal/orders/:orderId/capture', [
          PaypalPaymentsController,
          'captureOrder',
        ])
      })
      .as('catalog')

    router
      .group(() => {
        router.post('licenses', [LicensesController, 'store'])
        router.patch('licenses/:id', [LicensesController, 'update'])
        router.delete('licenses/:id', [LicensesController, 'destroy'])

        router.post('tags', [TagsController, 'store'])
        router.patch('tags/:id', [TagsController, 'update'])
        router.delete('tags/:id', [TagsController, 'destroy'])

        router.post('musical-keys', [MusicalKeysController, 'store'])
        router.patch('musical-keys/:id', [MusicalKeysController, 'update'])
        router.delete('musical-keys/:id', [MusicalKeysController, 'destroy'])

        router.post('tracks', [TracksController, 'store'])
        router.patch('tracks/:id', [TracksController, 'update'])
        router.delete('tracks/:id', [TracksController, 'destroy'])
        router.get('tracks/:id/licenses', [TrackLicensesController, 'show'])
        router.put('tracks/:id/licenses', [TrackLicensesController, 'update'])
      })
      .as('catalog.manage')
      .use(middleware.auth())
  })
  .prefix('/api/v1')
