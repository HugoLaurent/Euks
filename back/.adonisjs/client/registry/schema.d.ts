/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.access_token.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'catalog.licenses.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/licenses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['index']>>>
    }
  }
  'catalog.licenses.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/licenses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['show']>>>
    }
  }
  'catalog.tags.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/tags'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['index']>>>
    }
  }
  'catalog.tags.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/tags/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['show']>>>
    }
  }
  'catalog.musical_keys.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/musical-keys'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['index']>>>
    }
  }
  'catalog.musical_keys.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/musical-keys/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['show']>>>
    }
  }
  'catalog.tracks.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/tracks'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['index']>>>
    }
  }
  'catalog.tracks.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/tracks/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['show']>>>
    }
  }
  'catalog.paypal_payments.config': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/payments/paypal/config'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/paypal_payments_controller').default['config']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/paypal_payments_controller').default['config']>>>
    }
  }
  'catalog.paypal_payments.create_order': {
    methods: ["POST"]
    pattern: '/api/v1/payments/paypal/orders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/paypal').createPayPalOrderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/paypal').createPayPalOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/paypal_payments_controller').default['createOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/paypal_payments_controller').default['createOrder']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.paypal_payments.capture_order': {
    methods: ["POST"]
    pattern: '/api/v1/payments/paypal/orders/:orderId/capture'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/paypal').capturePayPalOrderValidator)>>
      paramsTuple: [ParamValue]
      params: { orderId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/paypal').capturePayPalOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/paypal_payments_controller').default['captureOrder']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/paypal_payments_controller').default['captureOrder']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.licenses.store': {
    methods: ["POST"]
    pattern: '/api/v1/licenses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/license').createLicenseValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/license').createLicenseValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.licenses.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/licenses/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/license').updateLicenseValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/license').updateLicenseValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.licenses.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/licenses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/licenses_controller').default['destroy']>>>
    }
  }
  'catalog.manage.tags.store': {
    methods: ["POST"]
    pattern: '/api/v1/tags'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/tag').createTagValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/tag').createTagValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.tags.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/tags/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/tag').updateTagValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/tag').updateTagValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.tags.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/tags/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tags_controller').default['destroy']>>>
    }
  }
  'catalog.manage.musical_keys.store': {
    methods: ["POST"]
    pattern: '/api/v1/musical-keys'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/musical_key').createMusicalKeyValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/musical_key').createMusicalKeyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.musical_keys.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/musical-keys/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/musical_key').updateMusicalKeyValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/musical_key').updateMusicalKeyValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.musical_keys.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/musical-keys/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/musical_keys_controller').default['destroy']>>>
    }
  }
  'catalog.manage.tracks.store': {
    methods: ["POST"]
    pattern: '/api/v1/tracks'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/track').createTrackValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/track').createTrackValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.tracks.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/tracks/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/track').updateTrackValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/track').updateTrackValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'catalog.manage.tracks.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/tracks/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracks_controller').default['destroy']>>>
    }
  }
  'catalog.manage.track_licenses.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/tracks/:id/licenses'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/track_licenses_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/track_licenses_controller').default['show']>>>
    }
  }
  'catalog.manage.track_licenses.update': {
    methods: ["PUT"]
    pattern: '/api/v1/tracks/:id/licenses'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/track_license').syncTrackLicensesValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/track_license').syncTrackLicensesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/track_licenses_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/track_licenses_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
