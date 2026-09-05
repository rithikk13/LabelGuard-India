import { NextFunction, Request, Response } from 'express';
import { AuthService, JWTPayload } from './authService';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = AuthService.extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const payload = AuthService.verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }

  req.user = payload;
  return next();
}

export function requireRole(...roles: JWTPayload['role'][]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions for this operation' });
    }
    return next();
  };
}
