import type { FoodTruck, FoodTruckStatus } from "@/schemas/foodTruck"

export const filterTrucks = ({
	trucks,
	applicant,
	street,
	status,
}: {
	trucks: FoodTruck[]
	applicant?: string
	street?: string
	status: FoodTruckStatus
}) => {
	return trucks.filter((truck) => {
		const matchApplicant = applicant
			? truck.applicant.toLowerCase().includes(applicant.toLowerCase())
			: true

		const matchStatus = truck.status === status

		const matchStreet = street
			? truck.address.toLowerCase().includes(street.toLowerCase())
			: true

		return matchApplicant && matchStatus && matchStreet
	})
}
