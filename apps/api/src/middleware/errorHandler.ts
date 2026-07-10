import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  // Log full error details securely on the server
  console.error(`[Error] ${statusCode} - ${err.message}`, err.stack || err);

  const isOperational = err.isOperational || statusCode < 500;
  const message = isOperational ? err.message : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export const createError = (message: string, statusCode: number): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
