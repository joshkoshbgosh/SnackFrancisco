import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fetchFoodTrucks, fetchTruckDistances } from "./requests"
import { FOOD_TRUCKS_API_URL, GOOGLE_MAPS_MATRIX_URL_PREFIX } from "./constants"
import type { FoodTruck } from "@/schemas/foodTruck"
import type { GoogleDistanceMatrixResponse } from "@/schemas/googleMaps"
vi.mock('@/env', () => ({
  env: {
    GOOGLE_MAPS_API_KEY: 'mock_server_api_key_for_tests',
    VITE_GOOGLE_MAPS_API_KEY: 'mock_client_api_key_for_tests',
  },
}))
import { env } from "@/env"

const mockFetch = vi.fn()

const mockFoodTrucksData: FoodTruck[] = [
	{
		objectid: "1",
		applicant: "Truck A",
		address: "1 Main St",
		status: "APPROVED",
		location: { latitude: "37.0", longitude: "-122.0" },
		fooditems: "Food A",
		schedule: "http://example.com/scheduleA",
	},
	{
		objectid: "2",
		applicant: "Truck B",
		address: "2 Market St",
		status: "REQUESTED",
		location: { latitude: "37.1", longitude: "-122.1" },
		fooditems: "Food B",
		schedule: "http://example.com/scheduleB",
	},
	{
		objectid: "3", // This one has latitude "0.0" and should be filtered out
		applicant: "Truck C",
		address: "3 Park Ave",
		status: "APPROVED",
		location: { latitude: "0.0", longitude: "0.0" },
		fooditems: "Food C",
		schedule: "http://example.com/scheduleC",
	},
]

const mockDistanceMatrixData: GoogleDistanceMatrixResponse = {
	rows: [
		{
			elements: [
				{
					distance: { value: 1000, text: "1 km" },
					duration: { value: 120, text: "2 mins" },
					status: "OK",
				},
				{
					distance: { value: 2000, text: "2 km" },
					duration: { value: 240, text: "4 mins" },
					status: "OK",
				},
			],
		},
	],
	status: "OK",
}

describe("requests.ts", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", mockFetch)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		mockFetch.mockReset()
	})

	describe("fetchFoodTrucks", () => {
		it("should fetch, parse, and filter food trucks successfully", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockFoodTrucksData,
			} as Response)

			const result = await fetchFoodTrucks()

			expect(mockFetch).toHaveBeenCalledWith(FOOD_TRUCKS_API_URL)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data).toHaveLength(mockFoodTrucksData.length - 1) // One truck filtered out
				expect(
					result.data.find((t) => t.objectid === "3"),
				).toBeUndefined()
				expect(result.data.find((t) => t.objectid === "1")).toBeDefined()
			}
		})

		it("should return error if fetch fails (network error)", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network failure"))
			const result = await fetchFoodTrucks()
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe("Failed to fetch food trucks")
			}
		})

		it("should return error if response is not ok", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
			} as Response)
			const result = await fetchFoodTrucks()
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe("Failed to fetch food trucks")
			}
		})

		it("should return error if JSON parsing fails", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => {
					throw new Error("Invalid JSON")
				},
			} as unknown as Response)
			const result = await fetchFoodTrucks()
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe("Failed to fetch food trucks")
			}
		})

		it("should return error if Zod validation fails", async () => {
			const invalidData = [{ ...mockFoodTrucksData[0], status: "INVALID_STATUS" }]
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidData,
			} as Response)
			const result = await fetchFoodTrucks()
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe("Failed to fetch food trucks")
			}
		})
	})

	describe("fetchTruckDistances", () => {
		const trucksForDistance: FoodTruck[] = [
			mockFoodTrucksData[0],
			mockFoodTrucksData[1],
		]
		const lat = 37.0
		const lng = -122.0

		it("should fetch and parse truck distances successfully", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockDistanceMatrixData,
			} as Response)

			const result = await fetchTruckDistances(trucksForDistance, lat, lng)

			const expectedDestinations = trucksForDistance
				.map((t) => `${t.location.latitude},${t.location.longitude}`)
				.join("|")
			const expectedUrl = `${GOOGLE_MAPS_MATRIX_URL_PREFIX}?origins=${lat},${lng}&destinations=${expectedDestinations}&key=${env.GOOGLE_MAPS_API_KEY}`
			expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data).toEqual(mockDistanceMatrixData)
			}
		})

		it("should return error if fetch fails (network error)", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network failure"))
			const result = await fetchTruckDistances(trucksForDistance, lat, lng)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe("Failed to fetch food truck distances")
			}
		})

		it("should return error if Zod validation fails for distance matrix", async () => {
			const invalidDistanceData = { ...mockDistanceMatrixData, rows: [] } // Invalid: rows must have at least 1 element
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => invalidDistanceData,
			} as Response)
			const result = await fetchTruckDistances(trucksForDistance, lat, lng)
			expect(result.success).toBe(false)
			if (!result.success) {
				expect(result.error).toBe("Failed to fetch food truck distances")
			}
		})
	})
})
