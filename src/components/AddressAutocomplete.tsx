import { SF_BOUNDS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from "react-places-autocomplete"

export const AddressAutocomplete = ({
	value,
	onChange,
	onSelect,
}: {
	value?: string
	onChange: (value: string) => void
	onSelect: (address: string, lat: number, lng: number) => void
}) => {
	const handleSelect = async (value: string) => {
		try {
			const results = await geocodeByAddress(value)
			const latLng = await getLatLng(results[0])
			onChange(value)
			onSelect(value, latLng.lat, latLng.lng)
		} catch (e) {
			onChange("Failed to get location from address")
		}
	}

	return (
		<PlacesAutocomplete
			value={value}
			onChange={onChange}
			onSelect={handleSelect}
			searchOptions={{ locationRestriction: SF_BOUNDS, types: ["street_address"]}}
		>
			{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
				<div className="relative">
					<Input
						{...getInputProps({
							placeholder: "Enter an address in San Francisco...",
						})}
					/>
					<div className={cn("bg-white border rounded mt-2 absolute z-10 top-6 max-h-40 overflow-scroll",{"hidden": !loading && !suggestions.length})}>
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
				</div>
			)}
		</PlacesAutocomplete>
	)
}
