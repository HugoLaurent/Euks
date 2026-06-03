/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.access_token.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_token.store']['types'],
  },
  'auth.access_token.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.access_token.destroy']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.password_reset.forgot': {
    methods: ["POST"],
    pattern: '/api/v1/auth/forgot-password',
    tokens: [{"old":"/api/v1/auth/forgot-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['auth.password_reset.forgot']['types'],
  },
  'auth.password_reset.reset': {
    methods: ["POST"],
    pattern: '/api/v1/auth/reset-password',
    tokens: [{"old":"/api/v1/auth/reset-password","type":0,"val":"api","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['auth.password_reset.reset']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.profile.update': {
    methods: ["PUT"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.update']['types'],
  },
  'profile.profile.delete': {
    methods: ["DELETE"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.delete']['types'],
  },
  'profile.client_dashboard.purchases': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/purchases',
    tokens: [{"old":"/api/v1/account/purchases","type":0,"val":"api","end":""},{"old":"/api/v1/account/purchases","type":0,"val":"v1","end":""},{"old":"/api/v1/account/purchases","type":0,"val":"account","end":""},{"old":"/api/v1/account/purchases","type":0,"val":"purchases","end":""}],
    types: placeholder as Registry['profile.client_dashboard.purchases']['types'],
  },
  'profile.client_dashboard.downloads': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/downloads',
    tokens: [{"old":"/api/v1/account/downloads","type":0,"val":"api","end":""},{"old":"/api/v1/account/downloads","type":0,"val":"v1","end":""},{"old":"/api/v1/account/downloads","type":0,"val":"account","end":""},{"old":"/api/v1/account/downloads","type":0,"val":"downloads","end":""}],
    types: placeholder as Registry['profile.client_dashboard.downloads']['types'],
  },
  'catalog.licenses.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/licenses',
    tokens: [{"old":"/api/v1/licenses","type":0,"val":"api","end":""},{"old":"/api/v1/licenses","type":0,"val":"v1","end":""},{"old":"/api/v1/licenses","type":0,"val":"licenses","end":""}],
    types: placeholder as Registry['catalog.licenses.index']['types'],
  },
  'catalog.licenses.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/licenses/:id',
    tokens: [{"old":"/api/v1/licenses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/licenses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/licenses/:id","type":0,"val":"licenses","end":""},{"old":"/api/v1/licenses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.licenses.show']['types'],
  },
  'catalog.tags.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tags',
    tokens: [{"old":"/api/v1/tags","type":0,"val":"api","end":""},{"old":"/api/v1/tags","type":0,"val":"v1","end":""},{"old":"/api/v1/tags","type":0,"val":"tags","end":""}],
    types: placeholder as Registry['catalog.tags.index']['types'],
  },
  'catalog.tags.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tags/:id',
    tokens: [{"old":"/api/v1/tags/:id","type":0,"val":"api","end":""},{"old":"/api/v1/tags/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/tags/:id","type":0,"val":"tags","end":""},{"old":"/api/v1/tags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.tags.show']['types'],
  },
  'catalog.musical_keys.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/musical-keys',
    tokens: [{"old":"/api/v1/musical-keys","type":0,"val":"api","end":""},{"old":"/api/v1/musical-keys","type":0,"val":"v1","end":""},{"old":"/api/v1/musical-keys","type":0,"val":"musical-keys","end":""}],
    types: placeholder as Registry['catalog.musical_keys.index']['types'],
  },
  'catalog.musical_keys.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/musical-keys/:id',
    tokens: [{"old":"/api/v1/musical-keys/:id","type":0,"val":"api","end":""},{"old":"/api/v1/musical-keys/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/musical-keys/:id","type":0,"val":"musical-keys","end":""},{"old":"/api/v1/musical-keys/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.musical_keys.show']['types'],
  },
  'catalog.tracks.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tracks',
    tokens: [{"old":"/api/v1/tracks","type":0,"val":"api","end":""},{"old":"/api/v1/tracks","type":0,"val":"v1","end":""},{"old":"/api/v1/tracks","type":0,"val":"tracks","end":""}],
    types: placeholder as Registry['catalog.tracks.index']['types'],
  },
  'catalog.tracks.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tracks/:id',
    tokens: [{"old":"/api/v1/tracks/:id","type":0,"val":"api","end":""},{"old":"/api/v1/tracks/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/tracks/:id","type":0,"val":"tracks","end":""},{"old":"/api/v1/tracks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.tracks.show']['types'],
  },
  'catalog.paypal_payments.config': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/payments/paypal/config',
    tokens: [{"old":"/api/v1/payments/paypal/config","type":0,"val":"api","end":""},{"old":"/api/v1/payments/paypal/config","type":0,"val":"v1","end":""},{"old":"/api/v1/payments/paypal/config","type":0,"val":"payments","end":""},{"old":"/api/v1/payments/paypal/config","type":0,"val":"paypal","end":""},{"old":"/api/v1/payments/paypal/config","type":0,"val":"config","end":""}],
    types: placeholder as Registry['catalog.paypal_payments.config']['types'],
  },
  'catalog.paypal_payments.create_order': {
    methods: ["POST"],
    pattern: '/api/v1/payments/paypal/orders',
    tokens: [{"old":"/api/v1/payments/paypal/orders","type":0,"val":"api","end":""},{"old":"/api/v1/payments/paypal/orders","type":0,"val":"v1","end":""},{"old":"/api/v1/payments/paypal/orders","type":0,"val":"payments","end":""},{"old":"/api/v1/payments/paypal/orders","type":0,"val":"paypal","end":""},{"old":"/api/v1/payments/paypal/orders","type":0,"val":"orders","end":""}],
    types: placeholder as Registry['catalog.paypal_payments.create_order']['types'],
  },
  'catalog.paypal_payments.capture_order': {
    methods: ["POST"],
    pattern: '/api/v1/payments/paypal/orders/:orderId/capture',
    tokens: [{"old":"/api/v1/payments/paypal/orders/:orderId/capture","type":0,"val":"api","end":""},{"old":"/api/v1/payments/paypal/orders/:orderId/capture","type":0,"val":"v1","end":""},{"old":"/api/v1/payments/paypal/orders/:orderId/capture","type":0,"val":"payments","end":""},{"old":"/api/v1/payments/paypal/orders/:orderId/capture","type":0,"val":"paypal","end":""},{"old":"/api/v1/payments/paypal/orders/:orderId/capture","type":0,"val":"orders","end":""},{"old":"/api/v1/payments/paypal/orders/:orderId/capture","type":1,"val":"orderId","end":""},{"old":"/api/v1/payments/paypal/orders/:orderId/capture","type":0,"val":"capture","end":""}],
    types: placeholder as Registry['catalog.paypal_payments.capture_order']['types'],
  },
  'catalog.client_dashboard.download': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/downloads/:token',
    tokens: [{"old":"/api/v1/downloads/:token","type":0,"val":"api","end":""},{"old":"/api/v1/downloads/:token","type":0,"val":"v1","end":""},{"old":"/api/v1/downloads/:token","type":0,"val":"downloads","end":""},{"old":"/api/v1/downloads/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['catalog.client_dashboard.download']['types'],
  },
  'catalog.manage.dashboard.summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dashboard/summary',
    tokens: [{"old":"/api/v1/dashboard/summary","type":0,"val":"api","end":""},{"old":"/api/v1/dashboard/summary","type":0,"val":"v1","end":""},{"old":"/api/v1/dashboard/summary","type":0,"val":"dashboard","end":""},{"old":"/api/v1/dashboard/summary","type":0,"val":"summary","end":""}],
    types: placeholder as Registry['catalog.manage.dashboard.summary']['types'],
  },
  'catalog.manage.dashboard.purchases': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dashboard/purchases',
    tokens: [{"old":"/api/v1/dashboard/purchases","type":0,"val":"api","end":""},{"old":"/api/v1/dashboard/purchases","type":0,"val":"v1","end":""},{"old":"/api/v1/dashboard/purchases","type":0,"val":"dashboard","end":""},{"old":"/api/v1/dashboard/purchases","type":0,"val":"purchases","end":""}],
    types: placeholder as Registry['catalog.manage.dashboard.purchases']['types'],
  },
  'catalog.manage.dashboard.tracks': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dashboard/tracks',
    tokens: [{"old":"/api/v1/dashboard/tracks","type":0,"val":"api","end":""},{"old":"/api/v1/dashboard/tracks","type":0,"val":"v1","end":""},{"old":"/api/v1/dashboard/tracks","type":0,"val":"dashboard","end":""},{"old":"/api/v1/dashboard/tracks","type":0,"val":"tracks","end":""}],
    types: placeholder as Registry['catalog.manage.dashboard.tracks']['types'],
  },
  'catalog.manage.licenses.store': {
    methods: ["POST"],
    pattern: '/api/v1/licenses',
    tokens: [{"old":"/api/v1/licenses","type":0,"val":"api","end":""},{"old":"/api/v1/licenses","type":0,"val":"v1","end":""},{"old":"/api/v1/licenses","type":0,"val":"licenses","end":""}],
    types: placeholder as Registry['catalog.manage.licenses.store']['types'],
  },
  'catalog.manage.licenses.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/licenses/:id',
    tokens: [{"old":"/api/v1/licenses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/licenses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/licenses/:id","type":0,"val":"licenses","end":""},{"old":"/api/v1/licenses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.licenses.update']['types'],
  },
  'catalog.manage.licenses.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/licenses/:id',
    tokens: [{"old":"/api/v1/licenses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/licenses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/licenses/:id","type":0,"val":"licenses","end":""},{"old":"/api/v1/licenses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.licenses.destroy']['types'],
  },
  'catalog.manage.tags.store': {
    methods: ["POST"],
    pattern: '/api/v1/tags',
    tokens: [{"old":"/api/v1/tags","type":0,"val":"api","end":""},{"old":"/api/v1/tags","type":0,"val":"v1","end":""},{"old":"/api/v1/tags","type":0,"val":"tags","end":""}],
    types: placeholder as Registry['catalog.manage.tags.store']['types'],
  },
  'catalog.manage.tags.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/tags/:id',
    tokens: [{"old":"/api/v1/tags/:id","type":0,"val":"api","end":""},{"old":"/api/v1/tags/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/tags/:id","type":0,"val":"tags","end":""},{"old":"/api/v1/tags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.tags.update']['types'],
  },
  'catalog.manage.tags.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/tags/:id',
    tokens: [{"old":"/api/v1/tags/:id","type":0,"val":"api","end":""},{"old":"/api/v1/tags/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/tags/:id","type":0,"val":"tags","end":""},{"old":"/api/v1/tags/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.tags.destroy']['types'],
  },
  'catalog.manage.musical_keys.store': {
    methods: ["POST"],
    pattern: '/api/v1/musical-keys',
    tokens: [{"old":"/api/v1/musical-keys","type":0,"val":"api","end":""},{"old":"/api/v1/musical-keys","type":0,"val":"v1","end":""},{"old":"/api/v1/musical-keys","type":0,"val":"musical-keys","end":""}],
    types: placeholder as Registry['catalog.manage.musical_keys.store']['types'],
  },
  'catalog.manage.musical_keys.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/musical-keys/:id',
    tokens: [{"old":"/api/v1/musical-keys/:id","type":0,"val":"api","end":""},{"old":"/api/v1/musical-keys/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/musical-keys/:id","type":0,"val":"musical-keys","end":""},{"old":"/api/v1/musical-keys/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.musical_keys.update']['types'],
  },
  'catalog.manage.musical_keys.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/musical-keys/:id',
    tokens: [{"old":"/api/v1/musical-keys/:id","type":0,"val":"api","end":""},{"old":"/api/v1/musical-keys/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/musical-keys/:id","type":0,"val":"musical-keys","end":""},{"old":"/api/v1/musical-keys/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.musical_keys.destroy']['types'],
  },
  'catalog.manage.tracks.store': {
    methods: ["POST"],
    pattern: '/api/v1/tracks',
    tokens: [{"old":"/api/v1/tracks","type":0,"val":"api","end":""},{"old":"/api/v1/tracks","type":0,"val":"v1","end":""},{"old":"/api/v1/tracks","type":0,"val":"tracks","end":""}],
    types: placeholder as Registry['catalog.manage.tracks.store']['types'],
  },
  'catalog.manage.tracks.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/tracks/:id',
    tokens: [{"old":"/api/v1/tracks/:id","type":0,"val":"api","end":""},{"old":"/api/v1/tracks/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/tracks/:id","type":0,"val":"tracks","end":""},{"old":"/api/v1/tracks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.tracks.update']['types'],
  },
  'catalog.manage.tracks.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/tracks/:id',
    tokens: [{"old":"/api/v1/tracks/:id","type":0,"val":"api","end":""},{"old":"/api/v1/tracks/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/tracks/:id","type":0,"val":"tracks","end":""},{"old":"/api/v1/tracks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['catalog.manage.tracks.destroy']['types'],
  },
  'catalog.manage.track_licenses.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/tracks/:id/licenses',
    tokens: [{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"api","end":""},{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"v1","end":""},{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"tracks","end":""},{"old":"/api/v1/tracks/:id/licenses","type":1,"val":"id","end":""},{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"licenses","end":""}],
    types: placeholder as Registry['catalog.manage.track_licenses.show']['types'],
  },
  'catalog.manage.track_licenses.update': {
    methods: ["PUT"],
    pattern: '/api/v1/tracks/:id/licenses',
    tokens: [{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"api","end":""},{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"v1","end":""},{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"tracks","end":""},{"old":"/api/v1/tracks/:id/licenses","type":1,"val":"id","end":""},{"old":"/api/v1/tracks/:id/licenses","type":0,"val":"licenses","end":""}],
    types: placeholder as Registry['catalog.manage.track_licenses.update']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
