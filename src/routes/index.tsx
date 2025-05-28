import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { createFileRoute } from "@tanstack/react-router"
import type { FoodTruck } from "@/schemas/foodTruck"
import { useQuery } from "@tanstack/react-query"
import { SearchParamsSchema } from "@/schemas/searchParams"
import { searchTrucksServerFn } from "@/server/searchServerFn"

export const Route = createFileRoute("/")({
	component: SearchPage,
	validateSearch: SearchParamsSchema,
})

export function SearchPage() {
	const query = Route.useSearch({})

	const [formState, setFormState] = useState({
		applicant: query.applicant,
		street: query.street,
		status: query.status,
		origin: query.origin,
		sortBy: "DEFAULT" as "DEFAULT" | "PROXIMITY", // TODO: replace 'as'
	})

	const updateField = (field: keyof typeof formState, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }))
	}

	const search = useQuery({
		queryKey: ["search", formState],
		queryFn: async () => searchTrucksServerFn({ data: formState }),
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const params = new URLSearchParams()
		for (const [key, value] of Object.entries(formState)) {
			if (value) params.set(key, value)
		}
		history.replaceState(null, "", `/search?${params.toString()}`)
		search.refetch()
	}

	return (
		<div className="p-4 space-y-4">
			<form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
				<Input
					placeholder="Applicant"
					value={formState.applicant}
					onChange={(e) => updateField("applicant", e.target.value)}
				/>
				<Input
					placeholder="Street"
					value={formState.street}
					onChange={(e) => updateField("street", e.target.value)}
				/>
				<Select
					value={formState.status}
					onValueChange={(value) => updateField("status", value)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="APPROVED">Approved</SelectItem>
						<SelectItem value="REQUESTED">Requested</SelectItem>
						<SelectItem value="EXPIRED">Expired</SelectItem>
					</SelectContent>
				</Select>

				<ToggleGroup
					type="single"
					value={formState.sortBy}
					onValueChange={(val) => updateField("sortBy", val || "default")}
				>
					<ToggleGroupItem value="DEFAULT">Default</ToggleGroupItem>
					<ToggleGroupItem value="PROXIMITY">Proximity</ToggleGroupItem>
				</ToggleGroup>

				{formState.sortBy === "PROXIMITY" && (
					<Input
						placeholder="Origin (lat,lng)"
						value={formState.origin}
						onChange={(e) => updateField("origin", e.target.value)}
					/>
				)}
				<Button type="submit">Search</Button>
			</form>

			<div className="mt-4">
				{search.isPending && <p>Loading...</p>}
				{search.isError && (
					<p className="text-red-500">Error: {search.error.message}</p>
				)}
				{search.data?.success && search.data.data.map((truck: FoodTruck) => (
					<div key={truck.objectid}>{truck.applicant}</div>
				))}
			</div>
		</div>
	)
}
