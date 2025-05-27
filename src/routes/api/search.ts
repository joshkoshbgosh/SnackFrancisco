import { createAPIFileRoute } from "@tanstack/start/api"
import { json } from "@tanstack/start"
import { fetchFoodTrucks, fetchTruckDistances } from "@/utils/requests"
import { filterTrucks } from "@/utils/filterTrucks"
import { parseSearchParams, getSearchParams } from "@/utils/apiParams"

const MAX_BATCH_SIZE = 25
const MAX_CLOSEST_RESULTS = 999 // TODO: Set to 5 as per requirements if necessary

export const APIRoute = createAPIFileRoute("/api/search")({
	GET: async ({ request }) => {
		const url = new URL(request.url)
		const params = parseSearchParams(getSearchParams(url))
		if (params.errors) {
			return json(params.errors, { status: 400 })
		}

		const fetchFoodTrucksResponse = await fetchFoodTrucks()
		if (!fetchFoodTrucksResponse.success) {
			return json(fetchFoodTrucksResponse.error, { status: 500 })
		}

		const trucks = filterTrucks({
			trucks: fetchFoodTrucksResponse.data,
			applicant: params.applicant,
			street: params.street,
			status: params.status,
		})

		if (!params.origin) {
			return json(trucks)
		}
		const {lat,lng} = params.origin

		const batches = Array.from(
			{ length: Math.ceil(trucks.length / MAX_BATCH_SIZE) },
			(_, i) => trucks.slice(i * MAX_BATCH_SIZE, (i + 1) * MAX_BATCH_SIZE),
		)

		// Design Tradeoff. Swalling errors at the fetchTruckDistances function level
		// means all of the promises will resolve successfully regardless of whether the requests went through
		// So we have to treat Promise.all like allSettled. On the plus side, no try catches and it arguably allows more explicit error handling
		const truckDistanceRequests = batches.map((batch) =>
			fetchTruckDistances(batch, lat, lng),
		)
		const truckDistanceResponses = await Promise.all(truckDistanceRequests)
		const successfulTruckDistanceResponses = truckDistanceResponses.filter(
			(r) => r.success,
		)
		const allTruckDistanceRequestsSuccessful =
			successfulTruckDistanceResponses.length === truckDistanceResponses.length
		if (!allTruckDistanceRequestsSuccessful) {
			return json("Failed to fetch all truck distances", { status: 500 })
		}
		const elements = successfulTruckDistanceResponses.flatMap(
			(r) => r.data.rows[0].elements, // Unchecked index access but should be safe bc of Zod
		)
		if (!elements || elements.length !== trucks.length) {
			return json("Distance matrix error", { status: 500 })
		}

		const distanceResults = trucks.map((truck, i) => ({
			truck,
			distance_meters: elements[i].distance.value, // Unchecked index access but should be safe bc of Zod + length check
			duration_text: elements[i].duration.text, // Unchecked index access but should be safe bc of Zod + length check
		}))

		const closest = distanceResults
			.sort((a, b) => a.distance_meters - b.distance_meters)
			.slice(0, MAX_CLOSEST_RESULTS)
			.map(({ truck, distance_meters, duration_text }) => ({
				...truck,
				distance_meters,
				duration_text,
			}))

		return json(closest)
	},
})
