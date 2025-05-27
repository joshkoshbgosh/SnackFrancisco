export const swaggerSpec = {
	openapi: "3.0.0",
	info: {
		title: "SnackFrancisco API",
		version: "1.0.0",
		description: "Search and locate food trucks in San Francisco",
	},
	servers: [
		{
			url: "http://localhost:3000",
			description: "Local development server",
		},
		{
			url: "https://snack-francisco.vercel.app",
			description: "Production server",
		},
	],
	paths: {
		"/api/list": {
			get: {
				summary: "Get all food trucks",
				responses: {
					200: {
						description: "List of food trucks",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: { type: "object" },
								},
							},
						},
					},
				},
			},
		},
		"/api/search": {
			get: {
				summary: "Search food trucks",
				description:
					"Filter food trucks by applicant name, status, and street name.",
				parameters: [
					{
						name: "applicant",
						in: "query",
						description:
							"Partial match on the applicant name (case-insensitive)",
						required: false,
						schema: { type: "string" },
					},
					{
						name: "status",
						in: "query",
						description: "Exact match on the status (e.g., APPROVED)",
						required: false,
						schema: { type: "string" },
					},
					{
						name: "street",
						in: "query",
						description: "Partial match on the street name (case-insensitive)",
						required: false,
						schema: { type: "string" },
					},
				],
				responses: {
					200: {
						description: "Filtered food trucks",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: { type: "object" },
								},
							},
						},
					},
				},
			},
		},
		"/api/locate": {
			get: {
				tags: ["Food Trucks"],
				summary: "Get the 5 nearest food trucks to a given location",
				description:
					'Returns the 5 closest food trucks to the specified latitude and longitude, sorted by real-world travel distance using Google Maps Distance Matrix. Only "APPROVED" trucks are returned by default.',
				parameters: [
					{
						name: "lat",
						in: "query",
						required: true,
						schema: { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" },
						description: "Latitude of the user location",
            default: "37.786471"
					},
					{
						name: "lng",
						in: "query",
						required: true,
						schema: { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" },
						description: "Longitude of the user location",
            default: "-122.398546"
					},
					{
						name: "status",
						in: "query",
						required: false,
						schema: {
							type: "string",
							enum: ["APPROVED", "REQUESTED", "EXPIRED"],
						},
						description: "Filter by food truck status (default: APPROVED)",
					},
				],
				responses: {
					200: {
						description: "5 closest food trucks by travel distance",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										type: "object",
										properties: {
											objectid: { type: "string" },
											applicant: { type: "string" },
											address: { type: "string" },
											status: { type: "string" },
											fooditems: { type: "string" },
											schedule: { type: "string" },
											location: {
												type: "object",
												properties: {
													latitude: { type: "string" },
													longitude: { type: "string" },
												},
											},
											distance_meters: {
												type: "number",
												description: "Travel distance from user in meters",
											},
											duration_text: {
												type: "string",
												description: 'Estimated travel time (e.g., "3 mins")',
											},
										},
									},
								},
							},
						},
					},
					400: {
						description: "Missing or invalid lat/lng query parameters",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										error: { type: "string" },
									},
								},
							},
						},
					},
					502: {
						description: "Upstream data or Google API failure",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										error: { type: "string" },
									},
								},
							},
						},
					},
				},
			},
		},
	},
}
