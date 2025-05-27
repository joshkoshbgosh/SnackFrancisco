import { z } from 'zod'

export const FoodTruckSchema = z.object({
  objectid: z.string(),
  applicant: z.string(),
  address: z.string(),
  locationdescription: z.string().optional(),
  status: z.enum(['APPROVED', 'REQUESTED', 'EXPIRED', 'SUSPEND', 'ISSUED']),
  fooditems: z.string().optional(),
  schedule: z.string().url().optional(),
  location: z.object({
    latitude: z.string(),
    longitude: z.string(),
  }),
})

export type FoodTruck = z.infer<typeof FoodTruckSchema>
