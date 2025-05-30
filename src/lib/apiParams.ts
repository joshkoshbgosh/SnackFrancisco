import {
	isValidFoodTruckStatus,
	type FoodTruckStatus,
} from "@/schemas/foodTruck"
import { isValidLat, isValidLng } from "../schemas/latLng"

export const getSearchParams = (url: URL) => ({
	origin: url.searchParams.get("origin") ?? undefined,
	status: url.searchParams.get("status") ?? undefined,
	applicant: url.searchParams.get("applicant") ?? undefined,
	street: url.searchParams.get("street") ?? undefined,
})
