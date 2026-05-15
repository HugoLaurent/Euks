/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
  }
  catalog: {
    licenses: {
      index: typeof routes['catalog.licenses.index']
      show: typeof routes['catalog.licenses.show']
    }
    tags: {
      index: typeof routes['catalog.tags.index']
      show: typeof routes['catalog.tags.show']
    }
    musicalKeys: {
      index: typeof routes['catalog.musical_keys.index']
      show: typeof routes['catalog.musical_keys.show']
    }
    tracks: {
      index: typeof routes['catalog.tracks.index']
      show: typeof routes['catalog.tracks.show']
    }
    paypalPayments: {
      config: typeof routes['catalog.paypal_payments.config']
      createOrder: typeof routes['catalog.paypal_payments.create_order']
      captureOrder: typeof routes['catalog.paypal_payments.capture_order']
    }
    manage: {
      licenses: {
        store: typeof routes['catalog.manage.licenses.store']
        update: typeof routes['catalog.manage.licenses.update']
        destroy: typeof routes['catalog.manage.licenses.destroy']
      }
      tags: {
        store: typeof routes['catalog.manage.tags.store']
        update: typeof routes['catalog.manage.tags.update']
        destroy: typeof routes['catalog.manage.tags.destroy']
      }
      musicalKeys: {
        store: typeof routes['catalog.manage.musical_keys.store']
        update: typeof routes['catalog.manage.musical_keys.update']
        destroy: typeof routes['catalog.manage.musical_keys.destroy']
      }
      tracks: {
        store: typeof routes['catalog.manage.tracks.store']
        update: typeof routes['catalog.manage.tracks.update']
        destroy: typeof routes['catalog.manage.tracks.destroy']
      }
      trackLicenses: {
        show: typeof routes['catalog.manage.track_licenses.show']
        update: typeof routes['catalog.manage.track_licenses.update']
      }
    }
  }
}
