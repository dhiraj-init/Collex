import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { verifyAccessToken } from '../utils/token';
import { User, IUser, UserRole, VerificationStatus } from '../models/User';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Authentication middleware that verifies JWT access token
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please sign in to access this resource.', 401));
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Verify user still exists in database
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return next(new AppError('The student account associated with this session no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please sign in again or refresh your token.', 401));
    }
    return next(new AppError('Invalid or corrupted authentication token.', 401));
  }
}

/**
 * Role-based authorization middleware
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have administrative permission to perform this action.', 403));
    }

    next();
  };
}

/**
 * Student verification status authorization middleware
 */
export function requireVerification(requiredStatus: VerificationStatus) {
  const STATUS_LEVELS: Record<VerificationStatus, number> = {
    UNVERIFIED: 0,
    EMAIL_VERIFIED: 1,
    STUDENT_VERIFIED: 2,
  };

  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    const currentLevel = STATUS_LEVELS[req.user.verificationStatus] || 0;
    const requiredLevel = STATUS_LEVELS[requiredStatus] || 1;

    if (currentLevel < requiredLevel) {
      return next(
        new AppError(
          `This action requires ${requiredStatus.replace('_', ' ')} status. Please complete campus verification.`,
          403
        )
      );
    }

    next();
  };
}
