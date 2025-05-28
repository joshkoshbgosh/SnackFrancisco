import {
	AdvancedMarker,
	APIProvider,
	Map as VisGLMapView,
	Pin,
} from "@vis.gl/react-google-maps"
import { env } from "@/env"
import { SF_BOUNDS, SF_CENTRE } from "@/lib/constants"
import type { FoodTruck } from "@/schemas/foodTruck"

export const MapView = (props: {
    trucks: FoodTruck[],
    onClickTruck: (truck: FoodTruck) => void
}) => {
	return (
		<APIProvider apiKey={env.VITE_GOOGLE_MAPS_API_KEY}>
			<VisGLMapView
				style={{ width: "100vw", height: "100vh" }}
				restriction={{
					latLngBounds: SF_BOUNDS,
					strictBounds: true,
				}}
				defaultCenter={SF_CENTRE}
				defaultZoom={3}
				mapId={"21ceb70e60feaa1ef31070ac"}
				gestureHandling={"greedy"}
				disableDefaultUI={true}
				clickableIcons={false}
			>
				{props.trucks.map((truck: FoodTruck) => (
						<AdvancedMarker
							key={truck.objectid}
                            onClick={() => props.onClickTruck(truck)}
							position={{
								lat: Number(truck.location.latitude),
								lng: Number(truck.location.longitude),
							}}
						>
							<Pin
								background={"#FBBC04"}
								glyphColor={"#000"}
								borderColor={"#000"}
							/>
						</AdvancedMarker>
					))}
			</VisGLMapView>
		</APIProvider>
	)
}
