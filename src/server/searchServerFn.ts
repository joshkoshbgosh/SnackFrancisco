import type { FetchResponse } from "@/lib/requests"
import { searchTrucks } from "@/lib/searchTrucks"
import type { FoodTruck } from "@/schemas/foodTruck"
import { parseLatLngString } from "@/schemas/latLng"
import { SearchParamsSchema } from "@/schemas/searchParams"
import { createServerFn } from "@tanstack/start"
import { setResponseStatus } from "@tanstack/start/server"

export const searchTrucksServerFn = createServerFn()
	.validator(SearchParamsSchema.parse)
	.handler(async (ctx): Promise<FetchResponse<FoodTruck[]>> => {
		const { status = "APPROVED", applicant, street } = ctx.data // TODO: Shouldn't need default initializer for status bc of Zod schema default. Look into this
		const parsedOrigin = parseLatLngString(ctx.data.origin)
		const response = await searchTrucks({
			status,
			applicant,
			street,
			origin: parsedOrigin.success ? parsedOrigin.data : undefined,
		})
		if (!response.success) {
			setResponseStatus(response.error.status)
			return { success: false, error: response.error.message }
		}
		return { success: true, data: response.data}
	})