import { FOOD_TRUCKS_API_URL } from '@/utils/constants'
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { setResponseStatus } from '@tanstack/start/server'

export const APIRoute = createAPIFileRoute('/api/list')({
  GET: async () => {
    try {
      // TODO: check error cases on endpoint (does the endpoint sometimes return an error with 200?)
      const data = await fetch(FOOD_TRUCKS_API_URL).then(res => res.json())
      return json(data);
    } catch (error) {
      setResponseStatus(500);
      return new Response('Unable to fetch food trucks');
    }
  },
})
