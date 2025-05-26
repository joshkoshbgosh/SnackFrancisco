import { FOOD_TRUCKS_API_URL } from '@/utils/constants'
import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { setResponseStatus } from '@tanstack/start/server'
import { FoodTruckSchema } from '@/schemas/foodTruck'
import z from 'zod'

export const APIRoute = createAPIFileRoute('/api/list')({
  GET: async () => {
    try {
      // TODO: check error cases on endpoint (does the endpoint sometimes return an error with 200?)
      // TODO: implement caching
      const data = await fetch(FOOD_TRUCKS_API_URL).then(res => res.json())
      // TODO: specify in catch that error is validation related. Only relevant for devs so maybe an error log?
      const trucks = z.array(FoodTruckSchema).parse(data)
      return json(trucks);
    } catch (error) {
      setResponseStatus(500);
      return new Response('Unable to fetch food trucks');
    }
  },
})
