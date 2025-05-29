import z from "zod"

export const isValidLat = (lat: number) =>
	!Number.isNaN(lat) && Math.abs(lat) <= 90
export const isValidLng = (lng: number) =>
	!Number.isNaN(lng) && Math.abs(lng) <= 180

export const LatLngStringSchema = z.string().refine(
	(value) => {
        if (value === "") return true 
        
		const parts = decodeURIComponent(value).split(",")
		if (parts.length !== 2) return false

		const [lat, lng] = parts.map(Number)
		return isValidLat(lat) && isValidLng(lng)
	},
	{
		message: 'Invalid Location',
	},
)

export const parseLatLngString = (latLng: unknown) => {
	const result = LatLngStringSchema.safeParse(latLng)
	if (result.success)
		return {
			...result,
			data: {
				lat: Number(decodeURIComponent(result.data).split(",")[0]),
				lng: Number(decodeURIComponent(result.data).split(",")[1]),
			},
		}
	return result
}
