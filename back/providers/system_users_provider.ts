import { ensureSystemUsers } from '#services/system_users'
import type { ApplicationService } from '@adonisjs/core/types'

export default class SystemUsersProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    await ensureSystemUsers()
  }
}
