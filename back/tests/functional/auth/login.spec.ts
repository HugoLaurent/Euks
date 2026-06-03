import User from '#models/user'
import { getSystemUser } from '#services/system_users'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Auth login', (group) => {
  group.each.setup(async () => {
    return testUtils.db().truncate()
  })

  test('allows the admin user to login', async ({ client, assert }) => {
    const admin = getSystemUser('admin')

    const response = await client.post('/api/v1/auth/login').json({
      email: admin.email,
      password: admin.password,
    })

    response.assertOk()
    response.assertBodyContains({
      data: {
        user: {
          email: admin.email,
          role: admin.role,
        },
      },
    })

    const body = response.body()
    assert.isString(body.data.token)
    assert.isAbove(body.data.token.length, 0)
  })

  test('allows the owner user to login', async ({ client }) => {
    const owner = getSystemUser('owner')

    const response = await client.post('/api/v1/auth/login').json({
      email: owner.email,
      password: owner.password,
    })

    response.assertOk()
    response.assertBodyContains({
      data: {
        user: {
          email: owner.email,
          role: owner.role,
        },
      },
    })
  })

  test('allows a registered client to login', async ({ client, assert }) => {
    await User.create({
      fullName: 'Client',
      email: 'client@euks.local',
      password: 'Client123!',
      role: 'client',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'client@euks.local',
      password: 'Client123!',
    })

    response.assertOk()
    response.assertBodyContains({
      data: {
        user: {
          email: 'client@euks.local',
          role: 'client',
        },
      },
    })

    const body = response.body()
    assert.isString(body.data.token)
  })

  test('rejects invalid credentials', async ({ client }) => {
    await User.create({
      fullName: 'Client',
      email: 'client@euks.local',
      password: 'Client123!',
      role: 'client',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'client@euks.local',
      password: 'WrongPassword!',
    })

    response.assertBadRequest()
    response.assertBodyContains({
      errors: [
        {
          message: 'Invalid user credentials',
        },
      ],
    })
  })

  test('exposes a public signup endpoint that creates a client account', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      email: 'someone@euks.local',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      fullName: 'New Client',
    })

    response.assertCreated()
    response.assertBodyContains({
      user: {
        email: 'someone@euks.local',
        role: 'client',
      },
    })

    const body = response.body()
    assert.isString(body.token)
    assert.isAbove(body.token.length, 0)
  })
})
