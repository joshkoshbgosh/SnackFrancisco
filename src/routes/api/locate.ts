import { createAPIFileRoute } from "@tanstack/start/api";
import { json } from "@tanstack/start";
import { fetchFoodTrucks, fetchTruckDistances } from "@/utils/requests";

const MAX_BATCH_SIZE = 25
const MAX_CLOSEST_RESULTS = 5

export const APIRoute = createAPIFileRoute("/api/locate")({
	GET: async ({ request }) => {
		const url = new URL(request.url)
		const lat = url.searchParams.get("lat")
		const lng = url.searchParams.get("lng")
		const status = url.searchParams.get("status") || "APPROVED"

		// TODO: extract lat / lng validation. Also validate whether lat / lng are real, and ideally whether they're in SF
		if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
			return json("Missing or invalid lat/lng", { status: 400 })
		}

		const fetchFoodTrucksResponse = await fetchFoodTrucks();
		if (!fetchFoodTrucksResponse.success) {
			return json(fetchFoodTrucksResponse.error, { status: 500 })
		}

		const trucks = fetchFoodTrucksResponse.data
			.filter((t) => t.status === status)
			.splice(0, 25) // TODO: remove temp testing limit

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
			successfulTruckDistanceResponses.length === truckDistanceResponses.length;
		if (!allTruckDistanceRequestsSuccessful) {
			return json("Failed to fetch all truck distances", { status: 500 })
		}
		const elements = successfulTruckDistanceResponses.flatMap(
			(r) => r.data.rows[0].elements,
		)
		if (!elements || elements.length !== trucks.length) {
			return json("Distance matrix error", { status: 500 })
		}

		const distanceResults = trucks.map((truck, i) => ({
			truck,
			distance_meters: elements[i].distance.value,
			duration_text: elements[i].duration.text,
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
});
