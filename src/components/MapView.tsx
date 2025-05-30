import { Map as VisGLMapView, AdvancedMarker } from "@vis.gl/react-google-maps"
import { SF_BOUNDS, SF_CENTRE } from "@/lib/constants"
import type { FoodTruck } from "@/schemas/foodTruck"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export const MapView = (props: {
	origin?: {lat: number, lng: number}
	trucks: FoodTruck[]
	activeTruck?: FoodTruck
	onClickTruck: (truck: FoodTruck) => void
}) => {
	return (
		<VisGLMapView
			style={{ width: "100vw", height: "100vh" }}
			restriction={{
				latLngBounds: SF_BOUNDS,
				strictBounds: true,
			}}
			defaultCenter={props.origin ?? SF_CENTRE}
			defaultZoom={props.origin ? 15 : 3}
			mapId={"21ceb70e60feaa1ef31070ac"}
			gestureHandling={"greedy"}
			disableDefaultUI={true}
			clickableIcons={false}
		>
			{props.origin && (
				<AdvancedMarker
					position={props.origin}
				>
					<MapPin
						size={48}
						strokeWidth={1.6}
						className="fill-chart-1 stroke-primary-foreground animate-in fade-in slide-in-from-top-100 duration-1000"
					/>
				</AdvancedMarker>
			)}
			{props.trucks.map((truck: FoodTruck) => (
				<AdvancedMarker
					key={truck.objectid}
					onClick={() => props.onClickTruck(truck)}
					position={{
						lat: Number(truck.location.latitude),
						lng: Number(truck.location.longitude),
					}}
					title={truck.applicant}
				>
					<MapPin
						size={48}
						strokeWidth={1.6}
						className={cn(
							"fill-primary stroke-primary-foreground animate-in fade-in slide-in-from-top-100 duration-1000",
							{
								"animate-pulse":
									truck.objectid === props.activeTruck?.objectid,
							},
						)}
					/>
				</AdvancedMarker>
			))}
		</VisGLMapView>
	)
}
