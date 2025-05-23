import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { setResponseStatus } from '@tanstack/start/server'

const FOOD_TRUCKS_URL = 'https://data.sfgov.org/resource/rqzj-sfat.json'

export const APIRoute = createAPIFileRoute('/api/list')({
  GET: async () => {
    try {
      const data = await fetch(FOOD_TRUCKS_URL).then(res => res.json())
      return json(data);
    } catch (error) {
      setResponseStatus(500);
      return new Response('Unable to fetch food trucks');
    }
  },
})
