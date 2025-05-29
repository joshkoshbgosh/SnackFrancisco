import {
	APIProvider,
	Map as VisGLMapView,
	Marker,
} from "@vis.gl/react-google-maps"
import { env } from "@/env"
import { SF_BOUNDS, SF_CENTRE } from "@/lib/constants"
import type { FoodTruck } from "@/schemas/foodTruck"
import pin from "public/pin.svg"

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
						<Marker
							key={truck.objectid}
                            onClick={() => props.onClickTruck(truck)}
							position={{
								lat: Number(truck.location.latitude),
								lng: Number(truck.location.longitude),
							}}
							animation={google.maps.Animation.DROP}
							icon={pin}
						/>
					))}
			</VisGLMapView>
		</APIProvider>
	)
}
