import { createAPIFileRoute } from '@tanstack/start/api'
import { json } from '@tanstack/start'
import { FOOD_TRUCKS_API_URL } from '@/utils/constants'

export const APIRoute = createAPIFileRoute('/api/search')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const applicant = url.searchParams.get('applicant')?.toLowerCase()
    const status = url.searchParams.get('status')?.toLowerCase()
    const street = url.searchParams.get('street')?.toLowerCase()

    // TODO: handle error case
    // TODO: Implement caching
    const res = await fetch(FOOD_TRUCKS_API_URL)
    const data = await res.json()

    const filtered = data.filter((truck: any) => {
      const matchApplicant = applicant
        ? truck.applicant?.toLowerCase().includes(applicant)
        : true

      const matchStatus = status
        ? truck.status?.toLowerCase() === status
        : true

      const matchStreet = street
        ? truck.address?.toLowerCase().includes(street)
        : true

      return matchApplicant && matchStatus && matchStreet
    })

    return json(filtered)
  },
})
