import z from "zod";
import { FOOD_TRUCKS_API_URL } from "./constants";
import { FoodTruckSchema, type FoodTruck } from "@/schemas/foodTruck";
import { buildGoogleMapsMatrixURL } from "./googleMaps";
import {
	GoogleDistanceMatrixResponseSchema,
	type GoogleDistanceMatrixResponse,
} from "@/schemas/googleMaps";

// TODO: Add second generic type for error to allow consumers
// to receive a strictly enumerated type of possible error reasons
type FetchResponse<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			error: string;
	  };

// TODO: Look into filtering on Socrata's end so as to avoid filtering work on our end
// Not such a big deal if we're caching the responses
export const fetchFoodTrucks = async (): Promise<
	FetchResponse<FoodTruck[]>
> => {
	try {
		const response = await fetch(FOOD_TRUCKS_API_URL)
		const data = await response.json()
		const trucks = z.array(FoodTruckSchema).parse(data)

		return { success: true, data: trucks }
	} catch (e) {
		// TODO: check to see if error came from fetch, json parsing, or zod validation.
		// Trigger an error log, and give the consumer an enum of possible failure reasons to handle accordingly.
		return {
			success: false,
			error: "Failed to fetch food trucks",
		}
	}
};

export const fetchTruckDistances = async (
	trucks: FoodTruck[],
	lat: string,
	lng: string,
): Promise<FetchResponse<GoogleDistanceMatrixResponse>> => {
	// TODO: validate lat / lng
	const matrixURL = buildGoogleMapsMatrixURL(trucks, lat, lng);

	try {
		const response = await fetch(matrixURL);
		const data = await response.json();
		const matrix = GoogleDistanceMatrixResponseSchema.parse(data);

        // TODO: Handle cases where request went through successfully but either response status or element statuses are NOT "ok"
		return { success: true, data: matrix };
	} catch (e) {
		// TODO: check to see if error came from fetch, json parsing, or zod validation.
		// Trigger an error log, and give the consumer an enum of possible failure reasons to handle accordingly.
		return {
			success: false,
			error: "Failed to fetch food truck distances",
		};
	}
};
