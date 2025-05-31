import { describe, it, expect, vi, beforeEach } from "vitest"
vi.mock("@/env", () => ({
	env: {
		GOOGLE_MAPS_API_KEY: "mock_server_api_key_for_tests",
		VITE_GOOGLE_MAPS_API_KEY: "mock_client_api_key_for_tests",
	},
}))
import { searchTrucks } from "./searchTrucks"
import * as requests from "./requests" // To mock its exports
import type { FoodTruck, FoodTruckStatus } from "@/schemas/foodTruck"
import type { GoogleDistanceMatrixResponse } from "@/schemas/googleMaps"
import { MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE } from "./constants"
import type { SearchParamsSchemaType } from "@/schemas/searchParams"

// Mock the requests module
vi.mock("./requests")

// TODO: Mock filterTrucks to simplify these tests and focus on searchTrucks functionality

const mockedFetchFoodTrucks = vi.spyOn(requests, "fetchFoodTrucks")
const mockedFetchTruckDistances = vi.spyOn(requests, "fetchTruckDistances")

const baseMockTrucks: Omit<FoodTruck, "objectid" | "status">[] = [
	{
		applicant: "Pizza Place",
		address: "100 Main St",
		location: { latitude: "37.70", longitude: "-122.40" },
		fooditems: "Pizza",
	},
	{
		applicant: "Taco Truck",
		address: "200 Market St",
		location: { latitude: "37.71", longitude: "-122.41" },
		fooditems: "Tacos",
	},
	{
		applicant: "Burger Bus",
		address: "300 Broadway St",
		location: { latitude: "37.72", longitude: "-122.42" },
		fooditems: "Burgers",
	},
	{
		applicant: "Salad Stand",
		address: "400 Main St",
		location: { latitude: "37.73", longitude: "-122.43" },
		fooditems: "Salads",
	},
	{
		applicant: "Coffee Cart",
		address: "500 Market St",
		location: { latitude: "37.74", longitude: "-122.44" },
		fooditems: "Coffee",
	},
	{
		applicant: "Ice Cream Van",
		address: "600 Pier Ave",
		location: { latitude: "37.75", longitude: "-122.45" },
		fooditems: "Ice Cream",
	},
]

const createMockTrucks = (statuses: FoodTruckStatus[]): FoodTruck[] => {
	return statuses.map((status, i) => {
		// Use modulo to cycle through baseMockTrucks if statuses is longer
		const baseTruckData = baseMockTrucks[i % baseMockTrucks.length]
		return {
			...baseTruckData, // Spread the chosen base truck data
			applicant: `${baseTruckData.applicant} ${i + 1}`, // Make applicant unique
			objectid: (i + 1).toString(), // Unique objectid
			status: status,
			schedule: `http://example.com/schedule${i + 1}`,
			// Ensure all required fields from FoodTruck schema are present
			address: `${(i + 1) * 100} Mock St`, // Make address unique
			location: {
				// Make location somewhat unique
				latitude: (37.7 + i * 0.01).toString(),
				longitude: (-122.4 + i * 0.01).toString(),
			},
			fooditems: baseTruckData.fooditems || `Generated Food ${i + 1}`,
			locationdescription: `Generated Location Desc ${i + 1}`,
		}
	})
}

describe("searchTrucks", () => {
	beforeEach(() => {
		mockedFetchFoodTrucks.mockReset()
		mockedFetchTruckDistances.mockReset()
	})

	it("should return filtered trucks if no origin is provided", async () => {
		const allTrucks = createMockTrucks(["APPROVED", "REQUESTED", "APPROVED"])
		mockedFetchFoodTrucks.mockResolvedValueOnce({
			success: true,
			data: allTrucks,
		})

		const params = { applicant: "Pizza", status: "APPROVED" as FoodTruckStatus }
		const result = await searchTrucks(params)

		expect(mockedFetchFoodTrucks).toHaveBeenCalledTimes(1)
		expect(mockedFetchTruckDistances).not.toHaveBeenCalled()
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data).toHaveLength(1)
			expect(result.data[0].applicant).toContain("Pizza Place")
		}
	})

	it("should return error if fetchFoodTrucks fails (no origin)", async () => {
		mockedFetchFoodTrucks.mockResolvedValueOnce({
			success: false,
			error: "Fetch failed",
		})
		const params = { status: "APPROVED" as FoodTruckStatus }
		const result = await searchTrucks(params)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.message).toBe("Fetch failed")
			expect(result.error.status).toBe(500)
		}
	})

	it("should fetch distances, sort, and slice if origin is provided", async () => {
		const approvedTrucks = createMockTrucks([
			"APPROVED",
			"APPROVED",
			"APPROVED",
			"APPROVED",
			"APPROVED",
			"APPROVED", // 6 trucks
		])
		mockedFetchFoodTrucks.mockResolvedValueOnce({
			success: true,
			data: approvedTrucks,
		})

		const mockDistanceResponse: GoogleDistanceMatrixResponse = {
			rows: [
				{
					elements: [
						{
							distance: { value: 100, text: "100 meters" },
							duration: { value: 1, text: "1m" },
							status: "OK",
						},
						{
							distance: { value: 300, text: "300 meters" },
							duration: { value: 3, text: "3m" },
							status: "OK",
						},
						{
							distance: { value: 500, text: "500 meters" },
							duration: { value: 5, text: "5m" },
							status: "OK",
						},
						{
							distance: { value: 200, text: "200 meters" },
							duration: { value: 2, text: "2m" },
							status: "OK",
						},
						{
							distance: { value: 400, text: "400 meters" },
							duration: { value: 4, text: "4m" },
							status: "OK",
						},
						{
							distance: { value: 600, text: "600 meters" },
							duration: { value: 6, text: "6m" },
							status: "OK",
						},
					],
				},
			],
			status: "OK",
		}
		mockedFetchTruckDistances.mockResolvedValue({
			success: true,
			data: mockDistanceResponse,
		})

		const params: SearchParamsSchemaType = {
			status: "APPROVED" as FoodTruckStatus,
			origin: "37.0,-122.0",
		}
		const result = await searchTrucks(params)

		expect(mockedFetchFoodTrucks).toHaveBeenCalledTimes(1)
		expect(mockedFetchTruckDistances).toHaveBeenCalledTimes(1) // Only 6 trucks, so 1 batch
		expect(result.success).toBe(true)

		if (result.success) {
			expect(result.data[0].objectid).toBe(approvedTrucks[0].objectid) // 100m
			expect(result.data[1].objectid).toBe(approvedTrucks[3].objectid) // 200m
			expect(result.data[2].objectid).toBe(approvedTrucks[1].objectid) // 300m
			expect(result.data[3].objectid).toBe(approvedTrucks[4].objectid) // 400m
			expect(result.data[4].objectid).toBe(approvedTrucks[2].objectid) // 500m

			expect(result.data[0].distance_meters).toBe(100)
			expect(result.data[0].duration_text).toBe("1m")
		}
	})

	it("should handle batching for fetchTruckDistances if many trucks", async () => {
		// Create more trucks than MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE
		const numTrucks = MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE + 5
		const manyTrucks = createMockTrucks(
			Array(numTrucks).fill("APPROVED"),
		) as FoodTruck[]
		mockedFetchFoodTrucks.mockResolvedValueOnce({
			success: true,
			data: manyTrucks,
		})

		const mockDistanceElement = {
			distance: { value: 100 },
			duration: { text: "1m" },
			status: "OK",
		}
		const mockDistanceResponseBatch: GoogleDistanceMatrixResponse = {
			rows: [
				{
					elements: Array(MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE).fill(
						mockDistanceElement,
					),
				},
			],
			status: "OK",
		}
		const mockDistanceResponseLastBatch: GoogleDistanceMatrixResponse = {
			rows: [{ elements: Array(5).fill(mockDistanceElement) }],
			status: "OK",
		}

		mockedFetchTruckDistances
			.mockResolvedValueOnce({ success: true, data: mockDistanceResponseBatch })
			.mockResolvedValueOnce({
				success: true,
				data: mockDistanceResponseLastBatch,
			})

		const params: SearchParamsSchemaType = {
			status: "APPROVED" as FoodTruckStatus,
			origin: "37.0,-122.0",
		}
		await searchTrucks(params)

		const expectedBatches = Math.ceil(
			numTrucks / MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE,
		)
		expect(mockedFetchTruckDistances).toHaveBeenCalledTimes(expectedBatches)
	})

	it("should return error if fetchTruckDistances fails for any batch", async () => {
		const someTrucks = createMockTrucks(["APPROVED", "APPROVED"])
		mockedFetchFoodTrucks.mockResolvedValueOnce({
			success: true,
			data: someTrucks,
		})
		mockedFetchTruckDistances.mockResolvedValueOnce({
			success: false,
			error: "Distance fetch failed",
		})

		const params: SearchParamsSchemaType = {
			status: "APPROVED" as FoodTruckStatus,
			origin: "37.0,-122.0",
		}
		const result = await searchTrucks(params)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.message).toBe("Failed to fetch all truck distances")
		}
	})

	it("should return error if distance matrix elements length mismatch", async () => {
		const trucks = createMockTrucks(["APPROVED", "APPROVED"]) // 2 trucks
		mockedFetchFoodTrucks.mockResolvedValueOnce({ success: true, data: trucks })

		const mismatchedDistanceResponse: GoogleDistanceMatrixResponse = {
			rows: [
				{
					elements: [
						{
							distance: { value: 100, text: "100 meters" },
							duration: { text: "1m", value: 1 },
							status: "OK",
						},
					], // Only 1 element
				},
			],
			status: "OK",
		}
		mockedFetchTruckDistances.mockResolvedValueOnce({
			success: true,
			data: mismatchedDistanceResponse,
		})

		const params: SearchParamsSchemaType = {
			status: "APPROVED" as FoodTruckStatus,
			origin: "37.0,-122.0",
		}
		const result = await searchTrucks(params)

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.message).toBe("Distance matrix error")
		}
	})
})
