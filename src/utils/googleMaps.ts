import type { FoodTruck } from "@/schemas/foodTruck";
import { GOOGLE_MAPS_MATRIX_URL_PREFIX } from "./constants";
import { env } from "@/env";

export const buildGoogleMapsMatrixURL = (candidates: FoodTruck[], lat: string, lng: string) => {
    // TODO: validate lat / lng params
    
    // Build destinations string for Google API
    const destinations = candidates
      .map((t) => `${t.location.latitude},${t.location.longitude}`)
      .join('|')

    return`${GOOGLE_MAPS_MATRIX_URL_PREFIX}?origins=${lat},${lng}&destinations=${destinations}&key=${env.GOOGLE_MAPS_API_KEY}`
}