import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import type { Express } from 'express';
import Router from './routes/index.js'; 


const app: Express = express();

// Middleware
app.use(cors({ origin: process.env['WEB_ORIGIN'], credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});



// Routes
app.use('/api', Router);

// Error Handling (Baad mein detail mein karenge)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;