import type { FoodTruck } from "@/schemas/foodTruck"
import type { parseSearchParams } from "./apiParams"
import { filterTrucks } from "./filterTrucks"
import {
	fetchFoodTrucks,
	fetchTruckDistances,
	type FetchResponse,
} from "./requests"
import {
	MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE,
	MAX_CLOSEST_RESULTS,
} from "./constants"

export const searchTrucks = async (
	params: ReturnType<typeof parseSearchParams>,
): Promise<FetchResponse<FoodTruck[], { status: number; message: string }>> => {
	const fetchFoodTrucksResponse = await fetchFoodTrucks()
	if (!fetchFoodTrucksResponse.success) {
		return {
			success: false,
			error: { status: 500, message: fetchFoodTrucksResponse.error },
		}
	}

	const trucks = filterTrucks({
		trucks: fetchFoodTrucksResponse.data,
		applicant: params.applicant,
		street: params.street,
		status: params.status ?? "APPROVED",
	})

	if (!params.origin) {
		return { success: true, data: trucks }
	}
	const { lat, lng } = params.origin

	const batches = Array.from(
		{
			length: Math.ceil(
				trucks.length / MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE,
			),
		},
		(_, i) =>
			trucks.slice(
				i * MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE,
				(i + 1) * MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE,
			),
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
		return {
			success: false,
			error: { status: 500, message: "Failed to fetch all truck distances" },
		}
	}
	const elements = successfulTruckDistanceResponses.flatMap(
		(r) => r.data.rows[0].elements, // Unchecked index access but should be safe bc of Zod
	)
	if (!elements || elements.length !== trucks.length) {
		return {
			success: false,
			error: { status: 500, message: "Distance matrix error" },
		}
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
			...truck, // TODO: spread operator breaks type checking, YUCK
			distance_meters,
			duration_text,
		}))

	return { success: true, data: closest }
}
