// import swaggerJsdoc from 'swagger-jsdoc';

// const options: swaggerJsdoc.Options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'GASFlow API',
//       version: '1.0.0',
//       description: 'Multi-tenant LPG Cylinder Distribution Management API',
//     },
//     servers: [
//       {
//         url: 'http://localhost:4000',
//         description: 'Development server',
//       },
//     ],
//     components: {
//       securitySchemes: {
//         cookieAuth: {
//           type: 'apiKey',
//           in: 'cookie',
//           name: 'gasflow_sid',
//         },
//       },
//     },
//   },
//   // 👇 Yahan path update karo (modules ke andar jao)
//   apis: ['./src/modules/**/*.routes.ts'], 
// };

// export const swaggerSpec = swaggerJsdoc(options);




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
      // 👇 Yahan Schemas define karo
      schemas: {
        // Standard Error Response (Tumhare ApiError jaisa)
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation Error' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' },
                },
              },
            },
            timestamp: { type: 'string', example: '2026-11-06T10:00:00.000Z' },
          },
        },
        // Standard Success Response (Tumhare ApiResponse jaisa)
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Success' },
            data: { type: 'object' },
            timestamp: { type: 'string', example: '2026-11-06T10:00:00.000Z' },
          },
        },
        // Auth Specific Schemas
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'fullName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'owner@sharmagas.com' },
            password: { type: 'string', minLength: 8, example: 'StrongPass@123' },
            fullName: { type: 'string', example: 'Ramesh Sharma' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'owner@sharmagas.com' },
            password: { type: 'string', example: 'StrongPass@123' },
          },
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);