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
import type { FoodTruck, FoodTruckStatus } from "@/schemas/foodTruck"
import { useQuery } from "@tanstack/react-query"
import { SearchParamsSchema } from "@/schemas/searchParams"
import { searchTrucksServerFn } from "@/server/searchServerFn"
import { SEARCH_REQUEST_STALE_TIME_MS } from "@/lib/constants"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"

export const Route = createFileRoute("/")({
	component: SearchPage,
	validateSearch: SearchParamsSchema,
	loader: async (ctx) =>
		await searchTrucksServerFn({
			data: SearchParamsSchema.parse(
				Object.fromEntries(
					new URLSearchParams(ctx.location.searchStr).entries(),
				),
			),
		}), // NOTE: validation already handled by validateSearch, just parsing for TS
})

type FormState = {
	applicant?: string
	street?: string
	status?: FoodTruckStatus
	origin?: string
	sortBy: "DEFAULT" | "PROXIMITY"
}

export function SearchPage() {
	const query = Route.useSearch({})
	const loaderData = Route.useLoaderData()

	const [formState, setFormState] = useState<FormState>({
		applicant: query.applicant,
		street: query.street,
		status: query.status,
		origin: query.origin,
		sortBy: query.origin ? "PROXIMITY" : "DEFAULT",
	})
	const [committedQuery, setCommittedQuery] = useState(formState)

	// TODO: This is quick and dirty. Technically might result in false positive
	// dirty check because property order matters and I don't believe is guaranteed.
	// Also inefficient but probably negligible. Either implement custom equality
	// check or use equality checking library (probably overkill)
	const isDirty = JSON.stringify(formState) !== JSON.stringify(committedQuery)

	const updateField = (field: keyof typeof formState, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }))
	}
	const search = useQuery({
		queryKey: ["search", committedQuery],
		queryFn: async () => searchTrucksServerFn({ data: committedQuery }),
		initialData: loaderData,
		staleTime: SEARCH_REQUEST_STALE_TIME_MS,
	})

	// NOTE: Could use uncontrolled inputs and get their values
	// on submit. Less state updates / re-renders but feels
	// like a premature optimization
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (formState.sortBy === "PROXIMITY" && !formState.origin) {
			// TODO: Handle the fact that after user clicks address,
			// lat,lng lookup is async
			alert('missing origin')
			return
		}
		setCommittedQuery(formState)
		const params = new URLSearchParams()
		for (const [key, value] of Object.entries(formState)) {
			if (value) params.set(key, value)
		}
		history.replaceState(null, "", `?${params.toString()}`)
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
					<AddressAutocomplete
						onSelect={(_address, lat, lng) => {
							// TODO: Handle the fact that after user clicks address,
							// lat,lng lookup is async
							updateField("origin", `${lat},${lng}`)
						}}
					/>
				)}
				{isDirty && (
					<Button type="submit">
						Search
					</Button>
				)}
			</form>

			<div className="mt-4">
				{search.isFetching && <p>Loading...</p>}
				{search.isError && (
					<p className="text-red-500">Error: {search.error.message}</p>
				)}
				{search.data?.success &&
					search.data.data.map((truck: FoodTruck) => (
						<div key={truck.objectid}>{truck.applicant}</div>
					))}
			</div>
		</div>
	)
}
