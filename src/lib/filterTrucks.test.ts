import { describe, it, expect } from "vitest"
import { filterTrucks } from "./filterTrucks"
import type { FoodTruck } from "@/schemas/foodTruck"

const mockTrucks: FoodTruck[] = [
	{
		objectid: "1",
		applicant: "Leo's Hot Dogs",
		address: "123 Main St",
		status: "APPROVED",
		location: { latitude: "37.77", longitude: "-122.41" },
		fooditems: "Hot Dogs, Soda",
		schedule: "http://example.com/schedule1",
		locationdescription: "Near the park",
	},
	{
		objectid: "2",
		applicant: "Maria's Tacos",
		address: "456 Market St",
		status: "APPROVED",
		location: { latitude: "37.78", longitude: "-122.42" },
		fooditems: "Tacos, Burritos",
		schedule: "http://example.com/schedule2",
		locationdescription: "Downtown corner",
	},
	{
		objectid: "3",
		applicant: "Leo's Pizza Place",
		address: "789 Broadway Ave",
		status: "REQUESTED",
		location: { latitude: "37.79", longitude: "-122.43" },
		fooditems: "Pizza, Salad",
		schedule: "http://example.com/schedule3",
		locationdescription: "By the theater",
	},
	{
		objectid: "4",
		applicant: "Quick Bites",
		address: "101 Main St Alley",
		status: "EXPIRED",
		location: { latitude: "37.76", longitude: "-122.40" },
		fooditems: "Sandwiches",
		schedule: "http://example.com/schedule4",
		locationdescription: "Food court",
	},
]

describe("filterTrucks", () => {
	it("should return all trucks if no filters are provided (defaulting to APPROVED status)", () => {
		const result = filterTrucks({
			trucks: mockTrucks,
			status: "APPROVED",
		})
		expect(result).toHaveLength(2)
		expect(result.some((truck) => truck.applicant === "Leo's Hot Dogs")).toBe(
			true,
		)
		expect(result.some((truck) => truck.applicant === "Maria's Tacos")).toBe(
			true,
		)
	})

	it("should filter by applicant name (case-insensitive)", () => {
		const result = filterTrucks({
			trucks: mockTrucks,
			applicant: "lEo",
			status: "APPROVED", // Should only find "Leo's Hot Dogs" as "Leo's Pizza Place" is REQUESTED
		})
		expect(result).toHaveLength(1)
		expect(result[0].applicant).toBe("Leo's Hot Dogs")

		const result2 = filterTrucks({
			trucks: mockTrucks,
			applicant: "leO",
			status: "REQUESTED",
		})
		expect(result2).toHaveLength(1)
		expect(result2[0].applicant).toBe("Leo's Pizza Place")
	})

	it("should filter by street name (case-insensitive)", () => {
		const result = filterTrucks({
			trucks: mockTrucks,
			street: "main st",
			status: "APPROVED",
		})
		expect(result).toHaveLength(1) // Only "Leo's Hot Dogs" is on "Main St" and APPROVED
		expect(result[0].address).toBe("123 Main St")

		const result2 = filterTrucks({
			trucks: mockTrucks,
			street: "main st",
			status: "EXPIRED",
		})
		expect(result2).toHaveLength(1)
		expect(result2[0].address).toBe("101 Main St Alley")
	})

	it("should filter by status", () => {
		const result = filterTrucks({
			trucks: mockTrucks,
			status: "REQUESTED",
		})
		expect(result).toHaveLength(1)
		expect(result[0].status).toBe("REQUESTED")
		expect(result[0].applicant).toBe("Leo's Pizza Place")
	})

	it("should combine applicant, street, and status filters", () => {
		const result = filterTrucks({
			trucks: mockTrucks,
			applicant: "leo",
			street: "mAin",
			status: "APPROVED",
		})
		expect(result).toHaveLength(1)
		expect(result[0].applicant).toBe("Leo's Hot Dogs")
		expect(result[0].address).toBe("123 Main St")
		expect(result[0].status).toBe("APPROVED")
	})

	it("should return an empty array if no trucks match", () => {
		const result = filterTrucks({
			trucks: mockTrucks,
			applicant: "NonExistent",
			status: "APPROVED",
		})
		expect(result).toHaveLength(0)
	})

	it("should handle empty applicant or street strings correctly (treat as no filter for that field)", () => {
		const result = filterTrucks({
			trucks: mockTrucks,
			applicant: "",
			street: "",
			status: "APPROVED",
		})
		expect(result).toHaveLength(2) // All APPROVED trucks
	})
})
