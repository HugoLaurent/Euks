import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.password_reset.forgot': { paramsTuple?: []; params?: {} }
    'auth.password_reset.reset': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.profile.update': { paramsTuple?: []; params?: {} }
    'profile.profile.delete': { paramsTuple?: []; params?: {} }
    'profile.client_dashboard.purchases': { paramsTuple?: []; params?: {} }
    'profile.client_dashboard.downloads': { paramsTuple?: []; params?: {} }
    'catalog.licenses.index': { paramsTuple?: []; params?: {} }
    'catalog.licenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.tags.index': { paramsTuple?: []; params?: {} }
    'catalog.tags.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.musical_keys.index': { paramsTuple?: []; params?: {} }
    'catalog.musical_keys.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.tracks.index': { paramsTuple?: []; params?: {} }
    'catalog.tracks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.paypal_payments.config': { paramsTuple?: []; params?: {} }
    'catalog.paypal_payments.create_order': { paramsTuple?: []; params?: {} }
    'catalog.paypal_payments.capture_order': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'catalog.client_dashboard.download': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'catalog.manage.dashboard.summary': { paramsTuple?: []; params?: {} }
    'catalog.manage.dashboard.purchases': { paramsTuple?: []; params?: {} }
    'catalog.manage.dashboard.tracks': { paramsTuple?: []; params?: {} }
    'catalog.manage.licenses.store': { paramsTuple?: []; params?: {} }
    'catalog.manage.licenses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.licenses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tags.store': { paramsTuple?: []; params?: {} }
    'catalog.manage.tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.musical_keys.store': { paramsTuple?: []; params?: {} }
    'catalog.manage.musical_keys.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.musical_keys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tracks.store': { paramsTuple?: []; params?: {} }
    'catalog.manage.tracks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tracks.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.track_licenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.track_licenses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.password_reset.forgot': { paramsTuple?: []; params?: {} }
    'auth.password_reset.reset': { paramsTuple?: []; params?: {} }
    'catalog.paypal_payments.create_order': { paramsTuple?: []; params?: {} }
    'catalog.paypal_payments.capture_order': { paramsTuple: [ParamValue]; params: {'orderId': ParamValue} }
    'catalog.manage.licenses.store': { paramsTuple?: []; params?: {} }
    'catalog.manage.tags.store': { paramsTuple?: []; params?: {} }
    'catalog.manage.musical_keys.store': { paramsTuple?: []; params?: {} }
    'catalog.manage.tracks.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.client_dashboard.purchases': { paramsTuple?: []; params?: {} }
    'profile.client_dashboard.downloads': { paramsTuple?: []; params?: {} }
    'catalog.licenses.index': { paramsTuple?: []; params?: {} }
    'catalog.licenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.tags.index': { paramsTuple?: []; params?: {} }
    'catalog.tags.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.musical_keys.index': { paramsTuple?: []; params?: {} }
    'catalog.musical_keys.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.tracks.index': { paramsTuple?: []; params?: {} }
    'catalog.tracks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.paypal_payments.config': { paramsTuple?: []; params?: {} }
    'catalog.client_dashboard.download': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'catalog.manage.dashboard.summary': { paramsTuple?: []; params?: {} }
    'catalog.manage.dashboard.purchases': { paramsTuple?: []; params?: {} }
    'catalog.manage.dashboard.tracks': { paramsTuple?: []; params?: {} }
    'catalog.manage.track_licenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.client_dashboard.purchases': { paramsTuple?: []; params?: {} }
    'profile.client_dashboard.downloads': { paramsTuple?: []; params?: {} }
    'catalog.licenses.index': { paramsTuple?: []; params?: {} }
    'catalog.licenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.tags.index': { paramsTuple?: []; params?: {} }
    'catalog.tags.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.musical_keys.index': { paramsTuple?: []; params?: {} }
    'catalog.musical_keys.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.tracks.index': { paramsTuple?: []; params?: {} }
    'catalog.tracks.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.paypal_payments.config': { paramsTuple?: []; params?: {} }
    'catalog.client_dashboard.download': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'catalog.manage.dashboard.summary': { paramsTuple?: []; params?: {} }
    'catalog.manage.dashboard.purchases': { paramsTuple?: []; params?: {} }
    'catalog.manage.dashboard.tracks': { paramsTuple?: []; params?: {} }
    'catalog.manage.track_licenses.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'profile.profile.update': { paramsTuple?: []; params?: {} }
    'catalog.manage.track_licenses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'profile.profile.delete': { paramsTuple?: []; params?: {} }
    'catalog.manage.licenses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tags.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.musical_keys.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tracks.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'catalog.manage.licenses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tags.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.musical_keys.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'catalog.manage.tracks.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}