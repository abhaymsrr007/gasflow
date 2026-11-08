
import type { Response } from 'express';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: unknown[];
  timestamp: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 400,
    errors: unknown[] = [],
    isOperational = true
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors: unknown[] = []) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static conflict(message = 'Resource conflict') {
    return new ApiError(message, 409);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(message, 500, [], false);
  }

  static send(res: Response, error: unknown) {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors: unknown[] = [];

    if (error instanceof ApiError) {
      statusCode = error.statusCode;

      if (error.isOperational) {
        message = error.message;
        errors = error.errors;
      }
    } else if (error instanceof ZodError) {
      statusCode = 400;
      message = 'Validation Error';

      errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));
    } else {
      console.error('Unhandled Error:', error);
    }

    const response: ApiErrorResponse = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }
}
