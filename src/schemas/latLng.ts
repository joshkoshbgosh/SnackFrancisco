import type { Maybe } from "@/lib/maybe"
import z from "zod"

export const isValidLat = (lat: number) =>
	!Number.isNaN(lat) && Math.abs(lat) <= 90
export const isValidLng = (lng: number) =>
	!Number.isNaN(lng) && Math.abs(lng) <= 180

export const LatLngStringSchema = z
	.string()
	.min(1, { message: "Empty Location" })
	.refine(
		(value) => {
			const parts = decodeURIComponent(value).split(",")
			if (parts.length !== 2) return false

			const [lat, lng] = parts.map(Number)
			return isValidLat(lat) && isValidLng(lng)
		},
		{
			message: "Invalid Location",
		},
	)

export const parseLatLngString = (
	latLng: string,
): Maybe<{ lat: number; lng: number }> => {
	const result = LatLngStringSchema.safeParse(latLng)
	if (!result.success) {
		return { success: false, error: result.error.message }
	}
	const [lat, lng] = result.data.split(",").map(Number)
	if (!isValidLat(lat) || !isValidLng(lng)) {
		// This check is not strictly necessary, just a sanity check
		return {success: false, error: "Unexpected Invalid Location"}
	}
	return {
		success: true,
		data: { lat, lng },
	}
}
