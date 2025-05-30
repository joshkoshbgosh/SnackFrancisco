import type { ReactNode } from "react"
import {
	Outlet,
	createRootRoute,
	HeadContent,
	Scripts,
} from "@tanstack/react-router"
import appCss from "@/styles/app.css?url"
import { env } from "@/env"

export const Route = createRootRoute(
	{
		head: () => ({
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					title: "SnackFrancisco",
				},
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
			],
			scripts: [
				{
					src: `https://maps.googleapis.com/maps/api/js?key=${env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`,
					async: true,
					defer: true,
				},
			],
		}),
		component: RootComponent,
	},
)

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	)
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	)
}
