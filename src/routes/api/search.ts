import { createAPIFileRoute } from "@tanstack/start/api"
import { json } from "@tanstack/start"
import { getSearchParams } from "@/lib/apiParams"
import { searchTrucks } from "@/lib/searchTrucks"
import { SearchParamsSchema } from "@/schemas/searchParams"

export const APIRoute = createAPIFileRoute("/api/search")({
	GET: async ({ request }) => {
		const url = new URL(request.url)
		const params = SearchParamsSchema.safeParse(getSearchParams(url))
		if (!params.success) {
			return json(params.error, { status: 400 })
		}

		const searchResult = await searchTrucks(params.data)
		if (!searchResult.success) {
			return json(searchResult.error.message, {
				status: searchResult.error.status,
			})
		}

		return json(searchResult.data)
	},
})
