import { createAPIFileRoute } from "@tanstack/start/api"
import { json } from "@tanstack/start"
import { parseSearchParams, getSearchParams } from "@/lib/apiParams"
import { searchTrucks } from "@/lib/searchTrucks"

export const APIRoute = createAPIFileRoute("/api/search")({
	GET: async ({ request }) => {
		const url = new URL(request.url)
		const params = parseSearchParams(getSearchParams(url))
		if (params.errors) {
			return json(params.errors, { status: 400 })
		}

		const searchResult = await searchTrucks(params)
		if (!searchResult.success) {
			return json(searchResult.error.message, {
				status: searchResult.error.status,
			})
		}

		return json(searchResult.data)
	},
})
