import z from "zod"
import { FoodTruckStatusSchema } from "./foodTruck"
import { LatLngStringSchema } from "./latLng"

export const SearchFormSchema = z
  .object({
    applicant: z.string(),
    street: z.string(),
    status: FoodTruckStatusSchema,
    origin: LatLngStringSchema,
    sortBy: z.enum(['DEFAULT', 'PROXIMITY']),
  })
  .refine((data) => {
    if (data.sortBy === 'PROXIMITY') {
      return !!data.origin
    }
    return true
  }, {
    message: 'Location is required when sorting by proximity',
    path: ['origin'], // attach error to the `origin` field
  })

export type SearchFormSchemaType = z.infer<typeof SearchFormSchema>