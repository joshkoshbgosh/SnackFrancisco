// TODO: Colocate swagger specs with endpoint code
// TODO: doing this manually sucks, couldn't get swagger-jsdoc working, would love to find a way to autogen with TS
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
		"/api/search": {
			get: {
				tags: ["Food Trucks"],
				summary: "Search Food Trucks",
				description:
					'Returns food trucks filtered by applicant, street name, and status. If lat/lng specified in origin query param, results are sorted by real-world travel distance using Google Maps Distance Matrix',
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
						name: "street",
						in: "query",
						description: "Partial match on the street name (case-insensitive)",
						required: false,
						schema: { type: "string" },
					},
					{
						name: "origin",
						in: "query",
						required: true,
						schema: { type: "string" },
						description: "Comma Separated Latitude / Longitude of the user location",
            			default: "37.786471,-122.398546"
					},
					{
						name: "status",
						in: "query",
						required: false,
						schema: {
							type: "string",
							enum: ["APPROVED", "REQUESTED", "EXPIRED", "SUSPEND", "ISSUED"],
						},
						description: "Filter by food truck status (default: APPROVED)",
					},
				],
				responses: {
					200: {
						description: "Food trucks filtered by applicant, street, status, and sorted by distance if origin lat / lng provided",
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
						description: "Invalid query parameters",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										errors: { 
											type: "object",
											properties: {
												applicant: { type: "string" },
												status: { type: "string" },
												street: { type: "string" },
												origin: { type: "string" }
											}
										},
									},
								},
							},
						},
					},
					500: {
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
