import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async store({ response }: HttpContext) {
    return response.notFound({
      errors: [
        {
          message: 'Signup is disabled',
        },
      ],
    })
  }
}
