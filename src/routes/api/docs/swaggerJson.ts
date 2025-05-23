import { createAPIFileRoute } from '@tanstack/start/api'
import { json } from '@tanstack/start'
import { swaggerSpec } from 'src/swagger'

export const APIRoute = createAPIFileRoute('/api/docs/swaggerJson')({
  GET: async () => {
    return json(swaggerSpec)
  },
})
