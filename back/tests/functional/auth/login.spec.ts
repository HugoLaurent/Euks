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

  test('rejects any user outside the two managed accounts', async ({ client }) => {
    await User.create({
      fullName: 'Intrus',
      email: 'intrus@euks.local',
      password: 'Intrus123!',
      role: 'owner',
    })

    const response = await client.post('/api/v1/auth/login').json({
      email: 'intrus@euks.local',
      password: 'Intrus123!',
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

  test('does not expose a public signup endpoint anymore', async ({ client }) => {
    const response = await client.post('/api/v1/auth/signup').json({
      email: 'someone@euks.local',
      password: 'Secret123!',
    })

    response.assertNotFound()
  })
})
