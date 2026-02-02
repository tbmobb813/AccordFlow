import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Placeholder: verify Clerk JWT here
  // Fail closed until authentication is properly implemented.
  res.status(501).json({ error: 'Authentication middleware not implemented' });
}
