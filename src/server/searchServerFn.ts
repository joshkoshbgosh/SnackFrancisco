import type { Maybe } from "@/lib/maybe"
import { searchTrucks } from "@/lib/searchTrucks"
import type { FoodTruck } from "@/schemas/foodTruck"
import { parseLatLngString } from "@/schemas/latLng"
import { SearchParamsSchema } from "@/schemas/searchParams"
import { createServerFn } from "@tanstack/start"
import { setResponseStatus } from "@tanstack/start/server"

export const searchTrucksServerFn = createServerFn()
	.validator(SearchParamsSchema.parse)
	.handler(async (ctx): Promise<Maybe<FoodTruck[]>> => {
		const { status = "APPROVED", applicant, street } = ctx.data
		let origin: {lat: number, lng: number} | undefined
		if (ctx.data.origin !== undefined) {
			const parsedOrigin = parseLatLngString(ctx.data.origin)
			if (!parsedOrigin.success) {
				return { success: false, error: "Invalid origin" }
			}
			origin = parsedOrigin.data
		}

		const response = await searchTrucks({
			status,
			applicant,
			street,
			origin,
		})
		if (!response.success) {
			setResponseStatus(response.error.status)
			return { success: false, error: response.error.message }
		}
		return { success: true, data: response.data }
	})
