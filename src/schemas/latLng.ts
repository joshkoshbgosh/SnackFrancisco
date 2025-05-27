import z from "zod"

export const isValidLat = (lat: number) => !Number.isNaN(lat) && Math.abs(lat) <= 90
export const isValidLng = (lng: number) => !Number.isNaN(lng) && Math.abs(lng) <= 180

export const LatLngStringSchema = z
  .string()
  .refine((value) => {
    const parts = value.split(',')
    if (parts.length !== 2) return false

    const [lat, lng] = parts.map(Number)
    return isValidLat(lat) && !isValidLng(lng)
  }, {
    message: 'Must be a string in "lat,lng" format with valid numbers',
  })