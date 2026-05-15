import env from '#start/env'
import db from '@adonisjs/lucid/services/db'

export type SystemUserRole = 'admin' | 'owner'

export type SystemUserDefinition = {
  role: SystemUserRole
  email: string
  password: string
  fullName: string | null
}

let pendingSync: Promise<void> | null = null

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeFullName(fullName: string | undefined, fallback: string) {
  const normalizedName = fullName?.trim()
  return normalizedName ? normalizedName : fallback
}

export function getSystemUsers(): SystemUserDefinition[] {
  const users: SystemUserDefinition[] = [
    {
      role: 'admin',
      email: normalizeEmail(env.get('ADMIN_EMAIL')),
      password: env.get('ADMIN_PASSWORD'),
      fullName: normalizeFullName(env.get('ADMIN_FULL_NAME'), 'Admin'),
    },
    {
      role: 'owner',
      email: normalizeEmail(env.get('OWNER_EMAIL')),
      password: env.get('OWNER_PASSWORD'),
      fullName: normalizeFullName(env.get('OWNER_FULL_NAME'), 'Site Owner'),
    },
  ]

  const uniqueEmails = new Set(users.map((user) => user.email))
  if (uniqueEmails.size !== users.length) {
    throw new Error('ADMIN_EMAIL and OWNER_EMAIL must be different')
  }

  return users
}

export function getSystemUser(role: SystemUserRole) {
  return getSystemUsers().find((user) => user.role === role)!
}

export function findSystemUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  return getSystemUsers().find((user) => user.email === normalizedEmail)
}

async function syncSystemUsersInternal() {
  const queryClient = db.connection()

  if (!(await queryClient.schema.hasTable('users'))) {
    return
  }

  if (!(await queryClient.schema.hasColumn('users', 'role'))) {
    return
  }

  const { default: User } = await import('#models/user')

  for (const systemUser of getSystemUsers()) {
    const user = await User.findBy('email', systemUser.email)

    if (user) {
      user.merge(systemUser)
      await user.save()
      continue
    }

    await User.create(systemUser)
  }
}

export async function ensureSystemUsers() {
  if (!pendingSync) {
    pendingSync = syncSystemUsersInternal().finally(() => {
      pendingSync = null
    })
  }

  await pendingSync
}
