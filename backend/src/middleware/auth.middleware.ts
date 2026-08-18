import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse';
import User, { IUser } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Protect routes
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check cookies for access token
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } 
  // Alternatively check Auth header (e.g. for Postman testing)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse('The user belonging to this token does no longer exist.', 401));
    }
    
    if (!user.isActive) {
      return next(new ErrorResponse('User account is deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user?.role} is not authorized to access this route`, 403));
    }
    next();
  };
};
