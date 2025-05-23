export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SnackFrancisco API',
    version: '1.0.0',
    description: 'Search and locate food trucks in San Francisco',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
    {
      url: 'https://snack-francisco.vercel.app',
      description: 'Production server',
    },
  ],
  paths: {
    '/api/list': {
      get: {
        summary: 'Get all food trucks',
        responses: {
          200: {
            description: 'List of food trucks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    '/api/search': {
      get: {
        summary: 'Search food trucks',
        description: 'Filter food trucks by applicant name, status, and street name.',
        parameters: [
          {
            name: 'applicant',
            in: 'query',
            description: 'Partial match on the applicant name (case-insensitive)',
            required: false,
            schema: { type: 'string' },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Exact match on the status (e.g., APPROVED)',
            required: false,
            schema: { type: 'string' },
          },
          {
            name: 'street',
            in: 'query',
            description: 'Partial match on the street name (case-insensitive)',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Filtered food trucks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  },
}
