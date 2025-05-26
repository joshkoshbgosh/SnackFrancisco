import { createAPIFileRoute } from '@tanstack/start/api'
import { json } from '@tanstack/start'
import { FOOD_TRUCKS_API_URL } from '@/utils/constants'
import { FoodTruckSchema } from '@/schemas/foodTruck'
import z from 'zod'
import { setResponseStatus } from '@tanstack/start/server'

export const APIRoute = createAPIFileRoute('/api/search')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const applicant = url.searchParams.get('applicant')?.toLowerCase()
    const status = url.searchParams.get('status')?.toLowerCase()
    const street = url.searchParams.get('street')?.toLowerCase()

    try {
      // TODO: handle error case
      // TODO: Implement caching
      const res = await fetch(FOOD_TRUCKS_API_URL)
      const data = await res.json()
      // TODO: specify in catch that error is validation related. Only relevant for devs so maybe an error log?
      const trucks = z.array(FoodTruckSchema).parse(data)

      const filtered = trucks.filter((truck) => {
        const matchApplicant = applicant
          ? truck.applicant.toLowerCase().includes(applicant)
          : true

        const matchStatus = status
          ? truck.status.toLowerCase() === status
          : true

        const matchStreet = street
          ? truck.address.toLowerCase().includes(street)
          : true

        return matchApplicant && matchStatus && matchStreet
      })

      return json(filtered)
    } catch (error) {
      setResponseStatus(500);
      return new Response('Unable to fetch food trucks');
    }
  },
})
