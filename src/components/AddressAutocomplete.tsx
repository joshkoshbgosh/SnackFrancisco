import { useState } from "react"
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-places-autocomplete"

export const AddressAutocomplete = ({
	onSelect,
}: {
	onSelect: (address: string, lat: number, lng: number) => void
}) => {
	const [address, setAddress] = useState("")
	const [error, setError] = useState<string | null>(null)

	const handleSelect = async (value: string) => {
		setAddress(value)
		try {
			const results = await geocodeByAddress(value)
			const latLng = await getLatLng(results[0])
			onSelect(value, latLng.lat, latLng.lng)
		} catch (e) {
			setError("Failed to get location from address")
		}
	}

	return (
		<PlacesAutocomplete
			value={address}
			onChange={setAddress}
			onSelect={handleSelect}
			searchOptions={{
				locationRestriction: {
					north: 37.929824,
					south: 37.63983,
					east: -122.28178,
					west: -123.173825,
				}, // Approximate bounds of SF
			}}
		>
			{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
				<div>
					<input
						{...getInputProps({
							placeholder: "Enter an address in San Francisco...",
							className: "input input-bordered w-full",
						})}
					/>
					<div className="bg-white border rounded mt-2">
						{loading && <div className="p-2 text-gray-500">Loading...</div>}
						{suggestions.map((suggestion) => {
							const className = suggestion.active
								? "p-2 bg-gray-200 cursor-pointer"
								: "p-2 cursor-pointer"
							return (
								// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
								<div {...getSuggestionItemProps(suggestion, { className })}>
									{suggestion.description}
								</div>
							)
						})}
					</div>
					{error && <div className="text-red-500 mt-2">{error}</div>}
				</div>
			)}
		</PlacesAutocomplete>
	)
}
