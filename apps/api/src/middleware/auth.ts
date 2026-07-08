import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  clerkId?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.clerkId = auth.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const auth = getAuth(req);
    if (auth && auth.userId) {
      req.clerkId = auth.userId;
    }
  } catch {
    // Continue without auth
  }
  next();
};
