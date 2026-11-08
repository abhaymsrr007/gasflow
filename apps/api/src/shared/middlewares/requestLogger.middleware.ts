import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Jab response complete ho jaye
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    const message = `${method} ${originalUrl} - Status: ${status} (${duration}ms)`;

    // Status code ke hisaab se color/log level change karo
    if (status >= 500) {
      logger.error(message); // 500 Server Error
    } else if (status >= 400) {
      logger.warn(message);  // 400 Client Error
    } else {
      logger.success(message); // 200 Success
    }
  });

  next();
}