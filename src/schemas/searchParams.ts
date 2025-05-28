import z from "zod";
import { FoodTruckStatusSchema } from "./foodTruck";
import { LatLngStringSchema } from "./latLng";

export const SearchParamsSchema = z.object({
    status: FoodTruckStatusSchema.optional(),
    applicant: z.string().optional(),
    street: z.string().optional(),
    origin: LatLngStringSchema.optional(),
})