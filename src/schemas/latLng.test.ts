import { describe, it, expect } from "vitest"
import {
	isValidLat,
	isValidLng,
	parseLatLngString,
	LatLngStringSchema,
} from "./latLng"

describe("isValidLat", () => {
	it("should return true for valid latitudes", () => {
		expect(isValidLat(0)).toBe(true)
		expect(isValidLat(90)).toBe(true)
		expect(isValidLat(-90)).toBe(true)
		expect(isValidLat(37.7749)).toBe(true)
	})

	it("should return false for invalid latitudes", () => {
		expect(isValidLat(90.1)).toBe(false)
		expect(isValidLat(-90.1)).toBe(false)
		expect(isValidLat(Number.NaN)).toBe(false)
	})
})

describe("isValidLng", () => {
	it("should return true for valid longitudes", () => {
		expect(isValidLng(0)).toBe(true)
		expect(isValidLng(180)).toBe(true)
		expect(isValidLng(-180)).toBe(true)
		expect(isValidLng(-122.4194)).toBe(true)
	})

	it("should return false for invalid longitudes", () => {
		expect(isValidLng(180.1)).toBe(false)
		expect(isValidLng(-180.1)).toBe(false)
		expect(isValidLng(Number.NaN)).toBe(false)
	})
})

describe("LatLngStringSchema", () => {
	it("should validate correct, non-empty lat,lng strings", () => {
		expect(LatLngStringSchema.safeParse("37.77,-122.41").success).toBe(true)
		expect(LatLngStringSchema.safeParse("0,0").success).toBe(true)
		expect(LatLngStringSchema.safeParse("90,180").success).toBe(true)
		expect(LatLngStringSchema.safeParse("-90,-180").success).toBe(true)
	})

	it("should invalidate empty or whitespace-only strings", () => {
		const emptyResult = LatLngStringSchema.safeParse("")
		expect(emptyResult.success).toBe(false)
		if (!emptyResult.success) {
			expect(emptyResult.error.message).toContain("Empty Location")
		}

		const whitespaceResult = LatLngStringSchema.safeParse("   ")
		expect(whitespaceResult.success).toBe(false)
		if (!whitespaceResult.success) {
			expect(whitespaceResult.error.message).toContain(
				"Invalid Location",
			)
		}
	})

	it("should invalidate incorrect lat,lng string formats", () => {
		expect(LatLngStringSchema.safeParse("37.77").success).toBe(false)
		expect(LatLngStringSchema.safeParse("37.77,-122.41,10").success).toBe(
			false,
		)
		expect(LatLngStringSchema.safeParse("abc,def").success).toBe(false)
	})

	it("should invalidate out-of-range latitudes or longitudes", () => {
		expect(LatLngStringSchema.safeParse("91,-122.41").success).toBe(false)
		expect(LatLngStringSchema.safeParse("37.77,-181").success).toBe(false)
	})

	it("should handle URL encoded strings correctly (schema validates decoded version)", () => {
		expect(LatLngStringSchema.safeParse("37.5%2C-122.5").success).toBe(true)
	})
})

describe("parseLatLngString", () => {
	it("should parse valid, non-empty lat,lng strings", () => {
		const result = parseLatLngString("37.7749,-122.4194")
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.lat).toBe(37.7749)
			expect(result.data.lng).toBe(-122.4194)
		}
	})

	it("should parse valid URL encoded lat,lng strings", () => {
		const result = parseLatLngString("37.123%2C-122.456")
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.lat).toBe(37.123)
			expect(result.data.lng).toBe(-122.456)
		}
	})

	it("should return success: false for empty string", () => {
		const result = parseLatLngString("")
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error).toContain("Empty Location")
		}
	})

	it("should return success: false for whitespace-only string", () => {
		const result = parseLatLngString("   ")
		expect(result.success).toBe(false)
	})

	it("should return success: false for malformed strings", () => {
		const resultMalformed = parseLatLngString("invalid")
		expect(resultMalformed.success).toBe(false)
		if (!resultMalformed.success) {
			expect(resultMalformed.error).toContain("Invalid Location")
		}

		const resultMissingPart = parseLatLngString("37.7749")
		expect(resultMissingPart.success).toBe(false)
		if (!resultMissingPart.success) {
			expect(resultMissingPart.error).toContain("Invalid Location")
		}
	})

	it("should return success: false for out-of-range coordinates", () => {
		const resultInvalidLat = parseLatLngString("91,-122")
		expect(resultInvalidLat.success).toBe(false)
		if (!resultInvalidLat.success) {
			expect(resultInvalidLat.error).toContain("Invalid Location")
		}
	})
})
