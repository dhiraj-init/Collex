import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { IUser, UserRole, VerificationStatus } from '../models/User';

export interface TokenPayload {
  userId: string;
  email: string;
  college: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generates paired access and refresh JWTs for a user
 */
export function generateAuthTokens(user: IUser): AuthTokens {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    college: user.college,
    role: user.role,
    verificationStatus: user.verificationStatus,
  };

  const accessToken = jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn as unknown as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign({ userId: user._id.toString() }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as unknown as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}

/**
 * Verifies an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtAccessSecret) as TokenPayload;
}

/**
 * Verifies a refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, config.jwtRefreshSecret) as { userId: string };
}
