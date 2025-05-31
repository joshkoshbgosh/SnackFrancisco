# SnackFrancisco - Mobile Food Facility Finder

## See it live!

https://snack-francisco.vercel.app/

Repo URL: https://github.com/joshkoshbgosh/SnackFrancisco

## Description of the Problem and Solution

Provides a UI to search for food trucks in San Francisco using the official San Francisco Mobile Food Facility Permit dataset and utilizes the Google Maps API (Places Autocomplete and Distance Matrix) for location-based features and displaying trucks on a map.

Built with **React (using TanStack Start)**, **TypeScript**, and **shadcn/ui**. It leverages **Zod** for runtime type safety and **React Hook Form** for managing form state. 

**Core Features Implemented:**

1.  **Search by Applicant Name:** Users can type in a partial or full name of a food truck applicant. (case-insensitive)
2.  **Search by Street Name:** Users can type in a partial or full street name to find trucks located on that street. (case-insensitive)
3.  **Filter by Status:** Both applicant and street searches can be filtered by the food truck's permit status (e.g., APPROVED, REQUESTED, EXPIRED). The default status filter is "APPROVED".
4.  **Proximity Search:** Users can enter an address (via Google Places Autocomplete) or allow the application to use their current location (functionality for user's current location not explicitly built but address input is present). The application then displays food trucks sorted by distance.
5.  **Interactive Map View:** Food trucks are displayed as pins on a Google Map. Users can click on a truck in the list to highlight and center it on the map. The user's specified origin for proximity search is also marked.

## Reasoning Behind Technical/Architectural Decisions

*   **Framework (TanStack Start & Router):**
    *   Chosen because all the cool kids are talking about it, and I wanted to see what the hype was about. Also chosen for data fetching/caching mechanisms, and type-safe full-stack capabilities (see `src/search/searchServerFn`, a function that is only actually run on the server but the client can calls it as if it was running on the browser).
*   **Styling (shadcn/ui + Radix / Tailwind):**
    *   Love shadcn/ui's approach of providing ready-to-use components built on top of headless Radix UI components that you can adjust later because they're in your codebase, not a package.
*   **Schema Validation (Zod):**
    *   Zod was used for defining data structures for API responses (food trucks, Google Distance Matrix), URL search parameters, and form inputs. This helped to ensure runtime type safety.
*   **Form Management (React Hook Form):**
    *   Selected for its performance, ease of use, and seamless integration with Zod for validation and shadcn/ui's <FormField/> form wrapper components.
*   **Data Fetching & State:**
    *   TanStack Router's loader capabilities, combined with server functions, were used for data fetching. This co-locates data dependencies with routes and provides built-in caching (`staleTime`, `gcTime`).
*   **API Interaction:**
    *   Food truck data is fetched directly from the `data.sfgov.org` API.
    *   Google Places Autocomplete API is used for address input.
    *   Google Distance Matrix API is used for calculating distances for proximity searches. API requests are batched to stay within usage limits.
*   **Environment Variables (`@t3-oss/env-core`):**
    *   Used to manage and validate environment variables (like API keys) for both client and server-side contexts, ensuring they are correctly loaded and typed.
*   **API Documentation (Swagger/OpenAPI):**
    *   Implemented a public API `/api/search` and Swagger UI to interact with it. The app itself doesn't actually use the API, it's just a thin wrapper over `src/lib/searchTrucks`, which is also used by the `src/server/searchServerFn` module, which is what is actually used by the application on both the client and server.

## Critique Section

### What would you have done differently if you had spent more time on this?

*   **More Comprehensive Testing:** While unit tests for key utility functions and schemas were implemented, I would have added:
    *   Component tests using React Testing Library for UI components like `AddressAutocomplete` (mocking external dependencies), the main search form, and the results display.
    *   End-to-end tests (e.g., using Playwright or Cypress) to verify user flows.
    *   More extensive testing for the `searchTrucks` logic, especially around edge cases with API responses.
*   **Update `AddressAutocomplete` Contract**
    *   All of shadcn/ui / radix's form control components comport themselves to react-hook-form's controller / context props for seamless integration with react-hook-form's state / error handling. I would like to do the same.
*   **Hide Coordinate Details from Users**
    *   While I think encoding location in coordinates for the url is fine, user's ideally shouldn't see coordinates in the address input ever. This could be done on initial page load with coordinates in the query param by the client using google's geocoding features to do an address lookup and populate the address input. It could also be done on the backend to avoid the client making an extra request. For the case of when the user selects an address in the UI, the address text could remain in that input while a hidden input could store the coordinate string.
*   **Refined Error Handling & User Feedback:**
    *   Implement more user-friendly error messages (e.g., toasts or inline messages) instead of `console.error` for issues like failed address geocoding or form validation errors.
    *   Provide clearer loading states for individual asynchronous operations beyond the global router loading state.
*   **Performance Optimizations:**
    *   For very large lists of trucks, implement virtualization for the results list (e.g., using TanStack Virtual).
    *   Further optimize re-renders in components.
*   **Accessibility (A11y):** Conduct a more thorough accessibility audit and ensure all components are fully ARIA compliant. While Radix UI helps, custom interactions would need careful review.
*   **User's Current Location:** Implement a button to allow users to use their browser's geolocation API to automatically populate the origin for proximity search.
*   **Debouncing Inputs:** For search-as-you-type fields (applicant, street), add debouncing to API calls or filtering logic to improve performance and reduce unnecessary operations.
*   **Backend Data Caching:** Although client-side caching was implemented, caching on the backend as well would be ideal

### What are the trade-offs that were made?

*   **Failed to show trucks with incomplete data** Relied on SF's data portal for coordinate info, there were a few trucks that had human readable addresses in SF but their lat/lng coordinates were 0,0. For simplicity's sake, I just filtered them out, but I could have implemented address lookups for those cases.
*   **Simplicity of Distance Calculation:** Relied on the Google Distance Matrix API for distance calculations. For a very high volume of requests, this could become costly. An alternative might involve Haversine formula calculations directly if only straight-line distance is needed and less accuracy is acceptable, or using a geospatial database (the socrata API provides opaque metadata that I believe map to zip codes / other geospatial data). Alternatively, since San Francisco isn't that big on a global scale, simple coordinate calculations assuming a flat earth could have worked.
*   **Full Data Loading:** The entire food truck dataset is fetched at once. For significantly larger datasets, server-side pagination and filtering (e.g., via SoQL on the Socrata API if supported for all desired fields) would be ideal.

### What are the things you left out?
There are a number of // TODO comments in the codebase, i'll only touch on some of them here

*   **Full Test Suite:** As mentioned, component and end-to-end tests were not fully implemented.
*   **Detailed Styling/Theming:** Focused on functionality; UI could use some work.
*   **Type Safety for Extended FoodTruck Object:** The `TODO` comment regarding the spread operator breaking type checking when adding `distance_meters` and `duration_text` to `FoodTruck` objects was not fully addressed by creating a separate `FoodTruckWithDistance` Zod schema and type. This would be a recommended refactor for stricter type safety. Then the server function could return a union type that would allow the client to know when it's going to receive just the food truck data or with distances.

### What are the problems with your implementation and how would you solve them if we had to scale the application to a large number of users?

*   **Data Fetching & Processing:**
    *   **Problem:** Fetching the entire dataset from `data.sfgov.org` on every load and performing client-side/server-function filtering can be inefficient for many users or if the dataset grows significantly.
    *   **Solution:**
        1.  **Dedicated Backend & Database:** Implement a dedicated backend service that ingests the food truck data through periodic cron jobs into a database (e.g., PostgreSQL with PostGIS for geospatial queries, or Elasticsearch for text search).
        2.  **Server-Side Filtering/Pagination:** The backend API would handle all filtering, sorting, and pagination, returning only the necessary data to the client.
        3.  **Geospatial Indexing:** Use PostGIS or similar to perform efficient "nearest neighbor" searches directly in the database instead of calculating distances to all filtered trucks.
*   **Logging / Observability**
    *   **Problem** If a user ran into runtime errors or performance issues, I would have limited information.
    *   **Solution** Using a service like Sentry would help get visibility
*   **API Rate Limiting (External APIs):**
    *   **Problem:** Heavy usage could lead to hitting rate limits for Google Maps APIs or the Socrata API.
    *   **Solution:**
        **Backend Proxy & Caching:** Route all external API calls through the dedicated backend. Implement caching (e.g., Redis) for responses from these APIs. Explore alternative approaches to distance calculation.
*   **Build Times / Size:**
    *   **Problem** node_modules is already ~300MB in dev. Haven't looked into production bundle sizes
    *   **Solution** There are probably some dependencies in my package.json that are only needed for dev, I would look into that. Code splitting and tree shaking are other things I would look into.
*   **Security Risks**
    *   **Problem** npm audit shows 13 moderate vulnerabilities that I haven't looked into. I also haven't set any limitations on my google maps api key
    *   **Solution** explore npm audit results, lock down api key capabilities / referrers
*   **Client-Side Performance:**
    *   **Problem:** Rendering very large lists of trucks or complex map interactions could slow down the UI.
    *   **Solution:**
        1.  **List Virtualization:** As mentioned, use libraries like TanStack Virtual for long lists.
        2.  **Map Marker Clustering:** For dense map areas, implement marker clustering.
        3.  **Optimized State Management:** Ensure efficient state updates to minimize re-renders. Didn't check for unecessary re-renders
        4.  **Replace Dynamic Map with Static Map** The dynamic interactive google maps instance is cool but probably unecessary and could be replaced with google's static Map API for example.

## Steps to Run

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn
*   A Google Maps API Key with "Maps JavaScript API", "Places API", and "Distance Matrix API" enabled.

### Environment Variables

Create a `.env` file in the root of the project with your Google Maps API keys:

```env
# Used by server-side logic (e.g., Distance Matrix API calls via server functions)
GOOGLE_MAPS_API_KEY=your_server_side_google_maps_api_key

# Used by client-side Google Maps (JS SDK, Places Autocomplete)
VITE_GOOGLE_MAPS_API_KEY=your_client_side_google_maps_api_key
```

**Note:** For security, ensure your client-side key has HTTP referrer restrictions and your server-side key has IP address restrictions if possible.

### Setup

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running the Application (Development Mode)

```bash
npm run dev
# or
# yarn dev
```
The application will be at `http://localhost:3000`.
The public API will be at `http://localhost:3000/api/search`
The interactive Swagger API documentation will be at `http://localhost:3000/docs` 
The OpenAPI JSON schema will be at `http://localhost:3000/api/docs/swaggerJson`

### Building for Production

```bash
npm run build
# or
# yarn build
```
To serve the production build locally (after building):
```bash
npm run start
# or
# yarn start
```

### Running Tests

Unit tests are implemented using Vitest.
```bash
npm run test
# or
# yarn test
```

