import z from "zod"
import { FoodTruckStatusSchema } from "./foodTruck"
import { LatLngStringSchema } from "./latLng"
import type { SearchFormSchemaType } from "./searchForm"

export const SearchParamsSchema = z.object({
	status: FoodTruckStatusSchema.optional(),
	applicant: z.string().optional(),
	street: z.string().optional(),
	origin: LatLngStringSchema.optional(),
})

export type SearchParamsSchemaType = z.infer<typeof SearchParamsSchema>

export const getSearchParamsFromFormData = (
	formData: SearchFormSchemaType,
): SearchParamsSchemaType => {
	// Filter empty values and form-only data (ie: sortBy)
	return Object.fromEntries(
		Object.entries(formData).filter(
			([key, value]) =>
				Object.keys(SearchParamsSchema.shape).includes(key) &&
				value.trim() !== "",
		),
	)
}
