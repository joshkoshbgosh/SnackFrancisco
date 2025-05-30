import z from "zod"
import { FoodTruckStatusSchema } from "./foodTruck"
import { LatLngStringSchema } from "./latLng"
import type { SearchParamsSchemaType } from "./searchParams"

export const SearchFormSchema = z
	.object({
		applicant: z.string(),
		street: z.string(),
		status: FoodTruckStatusSchema,
		origin: LatLngStringSchema,
		sortBy: z.enum(["DEFAULT", "PROXIMITY"]),
	})
	.refine(
		(data) => {
			if (data.sortBy === "PROXIMITY") {
				return !!data.origin
			}
			return true
		},
		{
			message: "Location is required when sorting by proximity",
			path: ["origin"], // attach error to the `origin` field
		},
	)

export type SearchFormSchemaType = z.infer<typeof SearchFormSchema>
export const defaultFormValues: SearchFormSchemaType = {
	applicant: "",
	street: "",
	status: "APPROVED",
	origin: "",
	sortBy: "DEFAULT",
}
export const getFormValuesFromQuery = (
	query: SearchParamsSchemaType,
): SearchFormSchemaType => ({
	...defaultFormValues,
	...query,
	sortBy: query.origin ? "PROXIMITY" : "DEFAULT",
})
