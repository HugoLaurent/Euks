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
import fs from 'node:fs/promises'
import { join } from 'node:path'

const AccessTokenController = () => import('#controllers/access_token_controller')
const ClientDashboardController = () => import('#controllers/client_dashboard_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const LicensesController = () => import('#controllers/licenses_controller')
const MusicalKeysController = () => import('#controllers/musical_keys_controller')
const PaypalPaymentsController = () => import('#controllers/paypal_payments_controller')
const ProfileController = () => import('#controllers/profile_controller')
const TagsController = () => import('#controllers/tags_controller')
const TrackLicensesController = () => import('#controllers/track_licenses_controller')
const TracksController = () => import('#controllers/tracks_controller')
const NewAccountController = () => import('#controllers/new_account_controller')

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('login', [AccessTokenController, 'store'])
        router.post('logout', [AccessTokenController, 'destroy']).use(middleware.auth())
        router.post('signup', [NewAccountController, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('/profile', [ProfileController, 'show'])
        router.put('/profile', [ProfileController, 'update'])
        router.delete('/profile', [ProfileController, 'delete'])
        router.get('purchases', [ClientDashboardController, 'purchases'])
        router.get('downloads', [ClientDashboardController, 'downloads'])
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
        router
          .post('payments/paypal/orders', [PaypalPaymentsController, 'createOrder'])
          .use(middleware.auth())
        router
          .post('payments/paypal/orders/:orderId/capture', [
            PaypalPaymentsController,
            'captureOrder',
          ])
          .use(middleware.auth())
        router
          .get('downloads/:token', [ClientDashboardController, 'download'])
          .use(middleware.auth())
      })
      .as('catalog')

    router
      .group(() => {
        router.get('dashboard/summary', [DashboardController, 'summary'])
        router.get('dashboard/purchases', [DashboardController, 'purchases'])
        router.get('dashboard/tracks', [DashboardController, 'tracks'])

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
      .use([middleware.auth(), middleware.admin()])
  })
  .prefix('/api/v1')

// Serve frontend for non-API GET routes (SPA fallback)
// This returns the built `index.html` from the `public` folder so
// client-side routing works in production.
router.get('*', async () => {
  try {
    const index = await fs.readFile(join(process.cwd(), 'public', 'index.html'), 'utf8')
    return index
  } catch (error) {
    // If index.html is not found, return a simple JSON to avoid 500s.
    return { ok: true }
  }
})
