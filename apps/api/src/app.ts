import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import type { Express } from 'express';
import router from './routes';
import { ApiError } from './shared/utils/apiError';
import { logger } from './shared/utils/logger';
import { requestLogger } from './shared/middlewares/requestLogger.middleware';


const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env['WEB_ORIGIN'], // Frontend ka exact URL
  credentials: true, // 👈 Cookies allow karne ke liye ye sabse zaroori hai
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

app.use(requestLogger);

// Swagger UI Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});



// Routes
app.use('/api', router);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(`Error on ${req.method} ${req.originalUrl}`, err);
  return ApiError.send(res, err);
});

export default app;