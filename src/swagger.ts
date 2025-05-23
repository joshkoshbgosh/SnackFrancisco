export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'SnackFrancisco API',
    version: '1.0.0',
    description: 'Search and locate food trucks in San Francisco',
  },
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
