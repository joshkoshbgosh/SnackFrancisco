import { z } from 'zod'

export const FoodTruckStatusSchema = z.enum(['APPROVED', 'REQUESTED', 'EXPIRED', 'SUSPEND', 'ISSUED'])

export const FoodTruckSchema = z.object({
  objectid: z.string(),
  applicant: z.string(),
  address: z.string(),
  locationdescription: z.string().optional(),
  status: FoodTruckStatusSchema,
  fooditems: z.string().optional(),
  schedule: z.string().url().optional(),
  location: z.object({
    latitude: z.string(),
    longitude: z.string(),
  }),
  distance_meters: z.number().optional(), // TODO: instead of hijacking the existing schema to monkey-patch distance info, create secondary schema so consumers know when to expect one or the other
  duration_text: z.string().optional()
})

export type FoodTruck = z.infer<typeof FoodTruckSchema>
export type FoodTruckStatus = z.infer<typeof FoodTruckStatusSchema>
export const isValidFoodTruckStatus = (status: string): status is FoodTruckStatus => {
  return FoodTruckStatusSchema.safeParse(status).success
}
