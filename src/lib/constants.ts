export const FOOD_TRUCKS_API_URL =
	"https://data.sfgov.org/resource/rqzj-sfat.json"
export const GOOGLE_MAPS_MATRIX_URL_PREFIX =
	"https://maps.googleapis.com/maps/api/distancematrix/json"

export const SEARCH_REQUEST_STALE_TIME_MS = 1000 * 60 * 60 * 24 // 24 Hours

export const MAX_GMAPS_DISTANCE_DESTINATIONS_BATCH_SIZE = 25
export const MAX_CLOSEST_RESULTS = 999 // TODO: Set to 5 as per requirements if necessary

export const SF_BOUNDS = {
	north: 37.929824,
	south: 37.63983,
	east: -122.21178,
	west: -122.843825,
} // Approximate bounds of SF

export const SF_CENTRE = {
	lat: 37.763055,
	lng: -122.441597,
}
