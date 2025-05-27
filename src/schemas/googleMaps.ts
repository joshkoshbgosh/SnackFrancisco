import { z } from "zod";

export const DistanceMatrixElementSchema = z.object({
	distance: z.object({
		value: z.number(), // in meters
		text: z.string(), // e.g. "1.3 km"
	}), // Technically, element might not include distance if no route found, so optional() might be better but for our case this should be fine

	duration: z.object({
		value: z.number(), // in seconds
		text: z.string().optional(), // e.g. "4 mins"
	}), // Technically, element might not include duration if no route found, so optional() might be better but for our case this should be fine

	status: z.string(), // TODO: change to enum based on possible values
});

export type DistanceMatrixElement = z.infer<typeof DistanceMatrixElementSchema>;

export const GoogleDistanceMatrixResponseSchema = z.object({
	rows: z.array(
		z.object({
			elements: z.array(DistanceMatrixElementSchema),
		}),
	).min(1).max(1), // Should only be one row since only considering one origin
	status: z.string(), // TODO: change to enum based on possible values
});

export type GoogleDistanceMatrixResponse = z.infer<
	typeof GoogleDistanceMatrixResponseSchema
>;
