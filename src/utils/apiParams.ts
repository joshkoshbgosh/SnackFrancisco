import {
	isValidFoodTruckStatus,
	type FoodTruckStatus,
} from "@/schemas/foodTruck"

export const getSearchParams = (url: URL) => ({
	origin: url.searchParams.get("origin") ?? undefined,
	status: url.searchParams.get("status") ?? undefined,
	applicant: url.searchParams.get("applicant") ?? undefined,
	street: url.searchParams.get("street") ?? undefined,
})

const isValidLat = (lat: number) => !Number.isNaN(lat) && Math.abs(lat) <= 90
const isValidLng = (lng: number) => !Number.isNaN(lng) && Math.abs(lng) <= 180

export const parseSearchParams = (params: {
	origin?: string
	status?: string
	applicant?: string
	street?: string
}) => {
	const errors: typeof params = {}

	const lat = Number(params.origin?.split(",")?.[0])
	const lng = Number(params.origin?.split(",")?.[1])

	if (params.origin && (!isValidLat(lat) || !isValidLng(lng))) {
		errors.origin = "Invalid Latitude / Longitude"
	}

	if (params.status && !isValidFoodTruckStatus(params.status)) {
		errors.status = "Invalid Status"
	}

	if (Object.keys(errors).length) {
		return { errors }
	}

	return {
		origin: params.origin ? { lat, lng } : undefined,
		status: (params.status as FoodTruckStatus) ?? "APPROVED", // TODO: This 'as' shouldn't be necessary
		applicant: params.applicant,
		street: params.street,
	}
}
