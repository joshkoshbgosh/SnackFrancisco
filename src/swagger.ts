import swaggerJSDoc from 'swagger-jsdoc'

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SnackFrancisco API',
      version: '1.0.0',
      description: 'API to search and locate mobile food facilities in San Francisco',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
      {
        url: 'http://snack-francisco.vercel.app',
      },
    ],
  },
  apis: ['src/routes/api/**/*.ts'],
})
