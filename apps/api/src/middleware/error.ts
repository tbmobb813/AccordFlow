import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status =
    err && typeof err.status === 'number' && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  const message =
    err && typeof err.message === 'string' && err.message.trim().length > 0
      ? err.message
      : 'Internal Server Error';

  res.status(status).json({ message });
}
