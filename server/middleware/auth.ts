import { Request, Response, NextFunction } from 'express';
import { auth } from '../firebase';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

// Middleware to verify Firebase ID token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the Firebase ID token
      const decodedToken = await auth.verifyIdToken(token);
      
      // Set user info on request object
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        role: decodedToken.role || 'customer'
      };
      
      next();
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user has required role
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const userRole = req.user.role || 'customer';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Optional authentication - doesn't require token but sets user if present
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = {
          id: decodedToken.uid,
          email: decodedToken.email || '',
          role: decodedToken.role || 'customer'
        };
      } catch (tokenError) {
        // Don't fail for optional auth, just don't set user
        console.warn('Optional auth token verification failed:', tokenError);
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};