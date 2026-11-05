import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GASFlow API',
      version: '1.0.0',
      description: 'Multi-tenant LPG Cylinder Distribution Management API',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'gasflow_sid',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Yahan hum apne routes ke comments se Swagger doc generate karenge
};

export const swaggerSpec = swaggerJsdoc(options);