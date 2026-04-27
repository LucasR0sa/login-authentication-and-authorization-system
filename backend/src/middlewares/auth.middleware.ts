import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const tokenFromCookie = req.cookies?.token as string | undefined;
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { id: string };
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
