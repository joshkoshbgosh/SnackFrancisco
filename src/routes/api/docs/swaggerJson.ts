import { createAPIFileRoute } from '@tanstack/react-start/api'
import { json } from '@tanstack/react-start'
import { swaggerSpec } from 'src/swagger'

export const APIRoute = createAPIFileRoute('/api/docs/swaggerJson')({
  GET: async () => {
    return json(swaggerSpec)
  },
})
