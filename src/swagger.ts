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
      url: 'https://your-app-name.vercel.app',
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
  },
}
