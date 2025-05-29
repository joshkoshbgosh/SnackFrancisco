import { useEffect, useState, type BaseSyntheticEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
	getSearchParamsFromFormData,
	SearchParamsSchema,
	type SearchParamsSchemaType,
} from "@/schemas/searchParams"
import { searchTrucksServerFn } from "@/server/searchServerFn"
import { SEARCH_REQUEST_STALE_TIME_MS } from "@/lib/constants"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"
import { MapView } from "@/components/MapView"
import { SlidersHorizontal } from "lucide-react"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	SearchFormSchema,
	type SearchFormSchemaType,
} from "@/schemas/searchForm"
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form"
import { Spinner } from "@/components/ui/spinner"

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

const defaultFormValues: SearchFormSchemaType = {
	applicant: "",
	street: "",
	status: "APPROVED",
	origin: "",
	sortBy: "DEFAULT",
}

const getInitialFormValues = (
	query: SearchParamsSchemaType,
): SearchFormSchemaType => ({
	...defaultFormValues,
	...query,
	sortBy: query.origin ? "PROXIMITY" : "DEFAULT",
})

// TODO: Extract Form
export function SearchPage() {
	const query = Route.useSearch({})
	const navigate = useNavigate({ from: Route.fullPath })
	const [isNavigating, setIsNavigating] = useState(false)
	const loaderData = Route.useLoaderData()

	const [isFormVisible, setIsFormVisible] = useState(false)
	const searchForm = useForm<SearchFormSchemaType>({
		resolver: zodResolver(SearchFormSchema),
		defaultValues: getInitialFormValues(query),
	})
	const sortBy = searchForm.watch("sortBy")

	const onValid = async (
		formData: SearchFormSchemaType,
		e?: BaseSyntheticEvent,
	) => {
		const formDataAsParams = getSearchParamsFromFormData(formData)
		setIsNavigating(true)
		await navigate({ search: formDataAsParams })
		setIsNavigating(false)
	}
	const onInvalid = (
		errors: typeof searchForm.formState.errors,
		e?: BaseSyntheticEvent,
	) => {
		console.error("Invalid form submission", errors)
	}
	const trucks = loaderData.success ? loaderData.data : []

	return (
		<div className="relative">
			<Button
				className="absolute top-4 right-4 z-10"
				onClick={() => setIsFormVisible(!isFormVisible)}
			>
				<SlidersHorizontal />
			</Button>
			{/* TODO: Implement onClickTruck */}
			<MapView trucks={trucks} onClickTruck={() => alert("truck")} />

			<Sheet
				open={isFormVisible}
				onOpenChange={(open) => setIsFormVisible(open)}
			>
				<SheetContent className="p-4">
					<Form {...searchForm}>
						<form onSubmit={searchForm.handleSubmit(onValid, onInvalid)}>
							<SheetHeader className="p-0 mb-4">
								<SheetTitle>Filters</SheetTitle>
								<SheetDescription>
									Narrow down your food truck search
								</SheetDescription>
							</SheetHeader>
							<FormField
								control={searchForm.control}
								name="applicant"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="Search by name..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="street"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Street</FormLabel>
										<FormControl>
											<Input placeholder="Search by street..." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Permit Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="APPROVED">APPROVED</SelectItem>
												<SelectItem value="REQUESTED">REQUESTED</SelectItem>
												<SelectItem value="EXPIRED">EXPIRED</SelectItem>
												<SelectItem value="SUSPEND">SUSPEND</SelectItem>
												<SelectItem value="ISSUED">ISSUED</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={searchForm.control}
								name="sortBy"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Sort By</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="DEFAULT">DEFAULT</SelectItem>
												<SelectItem value="PROXIMITY">PROXIMITY</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							{sortBy === "PROXIMITY" && (
								<FormField
									control={searchForm.control}
									name="origin"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Location</FormLabel>
											<FormControl>
												<AddressAutocomplete
													{...field}
													onSelect={(_address, lat, lng) => {
														// TODO: Handle the fact that after user clicks address,
														// lat,lng lookup is async
														searchForm.setValue("origin", `${lat},${lng}`)
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							<SheetFooter className="p-0">
								<Button type="submit" disabled={isNavigating}>
									Save changes
									{(searchForm.formState.isSubmitting ||
										isNavigating ||
										searchForm.formState.isLoading ||
										searchForm.formState.isValidating) && <Spinner />}
								</Button>
							</SheetFooter>
						</form>
					</Form>
				</SheetContent>
			</Sheet>
		</div>
	)
}
