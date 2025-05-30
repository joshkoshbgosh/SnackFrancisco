import { useState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	createFileRoute,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router"
import {
	getSearchParamsFromFormData,
	SearchParamsSchema,
} from "@/schemas/searchParams"
import { searchTrucksServerFn } from "@/server/searchServerFn"
import { SEARCH_REQUEST_STALE_TIME_MS } from "@/lib/constants"
import { AddressAutocomplete } from "@/components/AddressAutocomplete"
import { MapView } from "@/components/MapView"
import { Map as MapIcon, SlidersHorizontal } from "lucide-react"
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
	getFormValuesFromQuery,
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
import { Separator } from "@/components/ui/separator"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { FoodTruck } from "@/schemas/foodTruck"
import { APIProvider, useMap } from "@vis.gl/react-google-maps"
import { env } from "@/env"
import { parseLatLngString } from "@/schemas/latLng"

export const Route = createFileRoute("/")({
	component: Root,
	validateSearch: SearchParamsSchema,
	staleTime: SEARCH_REQUEST_STALE_TIME_MS,
	gcTime: SEARCH_REQUEST_STALE_TIME_MS,
	loaderDeps: (opts) => opts.search,
	loader: async (ctx) =>
		await searchTrucksServerFn({
			data: ctx.deps,
		}),
})

export function Root() {
	return (
		<APIProvider apiKey={env.VITE_GOOGLE_MAPS_API_KEY}>
			<SearchPage />
		</APIProvider>
	)
}

// TODO: Extract Form
export function SearchPage() {
	const query = Route.useSearch({})
	const navigate = useNavigate({ from: Route.fullPath })
	const isLoading = useRouterState({
		structuralSharing: true,
		select: (state) => state.status === "pending",
	})
	const loaderData = Route.useLoaderData()
	const trucks = loaderData.success ? loaderData.data : []

	const [isFormVisible, setIsFormVisible] = useState(true)
	const searchForm = useForm<SearchFormSchemaType>({
		resolver: zodResolver(SearchFormSchema),
		defaultValues: getFormValuesFromQuery(query),
	})
	const sortBy = searchForm.watch("sortBy")

	const onValid = async (formData: SearchFormSchemaType) => {
		const formDataAsParams = getSearchParamsFromFormData(formData)
		await navigate({ search: formDataAsParams })
		searchForm.reset(formData)
		if (!formData.origin) {
			console.error('test b')
			return
		}
		const parsedOrigin = parseLatLngString(formData.origin)
		if (!parsedOrigin.success || !map) {
			console.error("test")
			return
		}
		map.setCenter(parsedOrigin.data)
		map.setZoom(15)
	}
	const onInvalid = (errors: typeof searchForm.formState.errors) => {
		console.error("Invalid form submission", errors)
	}
	const [activeTruck, setActiveTruck] = useState<FoodTruck | undefined>(
		undefined,
	)

	const map = useMap()

	const parsedQueryOrigin = parseLatLngString(query.origin ?? "")
	const origin = parsedQueryOrigin.success ? parsedQueryOrigin.data : undefined

	return (
		<div className="relative">
			<Button
				className="absolute top-4 right-4 z-10"
				onClick={() => setIsFormVisible(!isFormVisible)}
			>
				<SlidersHorizontal />
			</Button>
			{/* TODO: Implement onClickTruck */}
			<MapView
				origin={origin}
				trucks={trucks}
				activeTruck={activeTruck}
				onClickTruck={(truck) => setActiveTruck(truck)}
			/>

			<Sheet
				open={isFormVisible}
				onOpenChange={(open) => setIsFormVisible(open)}
				modal={false}
			>
				<SheetContent className="p-4 overflow-y-scroll">
					<Form {...searchForm}>
						<form
							className="flex flex-wrap gap-x-2"
							onSubmit={searchForm.handleSubmit(onValid, onInvalid)}
						>
							<SheetHeader className="p-0 mb-4 w-full">
								<SheetTitle>Filters</SheetTitle>
							</SheetHeader>
							<FormField
								control={searchForm.control}
								name="applicant"
								render={({ field }) => (
									<FormItem className="flex-2/5">
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
									<FormItem className="flex-2/5">
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
									<FormItem className="flex-2/5">
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
									<FormItem className="flex-2/5">
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
										<FormItem className="flex-2/5">
											<FormLabel>Location</FormLabel>
											<FormControl>
												{/* TODO: Replace coordinates with addresses in UI */}
												<AddressAutocomplete
													{...field}
													onSelect={(_address, lat, lng) => {
														searchForm.setValue("origin", `${lat},${lng}`)
														searchForm.handleSubmit(onValid, onInvalid)
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}
							{searchForm.formState.isDirty && (
								<Button type="submit" disabled={isLoading} className="w-full">
									Save changes
									{(isLoading ||
										searchForm.formState.isSubmitting ||
										searchForm.formState.isLoading ||
										searchForm.formState.isValidating) && <Spinner />}
								</Button>
							)}
							<Separator className="w-full mb-2" />
							{trucks.map((truck) => (
								<Card
									key={truck.objectid}
									id={truck.objectid}
									className="w-full my-2 gap-y-2"
								>
									<CardHeader>
										<CardTitle>{truck.applicant}</CardTitle>
										<CardDescription>
											{truck.locationdescription}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{/* biome-ignore lint/a11y/useAnchorContent: <explanation> */}
										{/* TODO: Schedule links aren't working at time of writing*/}
										<a
											href={truck.schedule}
											className={cn(
												buttonVariants({ variant: "link" }),
												"px-0 py-0 h-6",
											)}
										>
											Schedule
										</a>
										<div>{truck.fooditems}</div>
									</CardContent>
									<CardFooter className="flex mt-2">
										<Button
											className="mr-auto"
											onClick={() => {
												setActiveTruck(truck)
												if (!map) return
												map.setCenter({
													lat: Number(truck.location.latitude),
													lng: Number(truck.location.longitude),
												})
												map.setZoom(15)
											}}
										>
											<MapIcon />
										</Button>
										{truck.distance_meters && (
											<CardDescription className="mr-1.5 self-end">{`${truck.distance_meters} meters, `}</CardDescription>
										)}
										{truck.duration_text && (
											<CardDescription className="self-end">{`${truck.duration_text} away`}</CardDescription>
										)}
									</CardFooter>
								</Card>
							))}
						</form>
					</Form>
				</SheetContent>
			</Sheet>
		</div>
	)
}
