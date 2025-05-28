import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
	server: {
		GOOGLE_MAPS_API_KEY: z.string().min(1),
	},
	runtimeEnvStrict: {
		GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
		VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
	},
	clientPrefix: "VITE_",
	client: {
		VITE_GOOGLE_MAPS_API_KEY: z.string().min(1),
	},
})
