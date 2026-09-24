import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { generateAuthTokens, verifyRefreshToken } from '../utils/token';
import { AppError } from '../utils/appError';
import { sendSuccess } from '../utils/apiResponse';
import { config } from '../config/env';

/**
 * Strips sensitive internal properties from the user document for client output
 */
function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    college: user.college,
    collegeDomain: user.collegeDomain,
    branch: user.branch,
    graduationYear: user.graduationYear,
    avatar: user.avatar,
    role: user.role,
    verificationStatus: user.verificationStatus,
    trustScore: user.trustScore,
    createdAt: user.createdAt,
  };
}

/**
 * Extracts and validates institutional domain from email
 */
function extractDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase().trim() : '';
}

/**
 * POST /api/v1/auth/register
 * Student Registration with Campus Domain Validation
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const { fullName, email, password, college, branch, graduationYear, avatar } = req.body;

    if (!fullName || !email || !password || !college || !branch || !graduationYear) {
      return next(new AppError('Please provide all required registration fields.', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();
    const domain = extractDomain(normalizedEmail);

    // Validate email domain against configured approved college domains
    const isDomainApproved = config.approvedCollegeDomains.some(
      (approved) => domain === approved || domain.endsWith(`.${approved}`)
    );

    if (!isDomainApproved) {
      return next(
        new AppError(
          `Your email domain (@${domain}) is not yet approved for Collex. Please use an approved institutional domain (${config.approvedCollegeDomains.join(', ')}).`,
          400
        )
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('An account with this college email already exists. Please sign in.', 409));
    }

    // Create user (password will be hashed via pre-save hook)
    const newUser = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      college: college.trim(),
      collegeDomain: domain,
      branch: branch.trim(),
      graduationYear: graduationYear.trim(),
      avatar: avatar || undefined,
      verificationStatus: 'EMAIL_VERIFIED', // Initial stage
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateAuthTokens(newUser);

    // Hash refresh token before saving in DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    newUser.refreshToken = hashedRefreshToken;

    await newUser.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Student registration successful. Welcome to Collex!',
      data: {
        user: sanitizeUser(newUser),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 * Student Login with Password Verification
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password.', 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly select password and refreshToken
    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
    if (!user) {
      // Safe generic message to prevent account harvesting
      return next(new AppError('Invalid email or password.', 401));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // Generate new tokens
    const { accessToken, refreshToken } = generateAuthTokens(user);

    // Update refresh token in DB
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return sendSuccess(
      res,
      {
        user: sanitizeUser(user),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      'Signed in successfully'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 * Refresh Access Token using Refresh Token
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required.', 400));
    }

    // Verify token validity
    const decoded = verifyRefreshToken(refreshToken);

    // Check user in DB
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || !user.refreshToken) {
      return next(new AppError('Invalid session. Please sign in again.', 401));
    }

    // Compare supplied token with stored hash
    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      return next(new AppError('Invalid or expired refresh token. Please sign in again.', 401));
    }

    // Rotate tokens
    const newTokens = generateAuthTokens(user);
    user.refreshToken = await bcrypt.hash(newTokens.refreshToken, 10);
    await user.save();

    return sendSuccess(
      res,
      {
        tokens: newTokens,
      },
      'Tokens refreshed successfully'
    );
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token.', 401));
  }
}

/**
 * POST /api/v1/auth/logout
 * Invalidate Refresh Token in Database
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void | Response> {
  try {
    if (req.user) {
      req.user.refreshToken = undefined;
      await req.user.save();
    }

    return sendSuccess(res, null, 'Signed out successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 * Returns Profile of Currently Authenticated Student
 */
export async function getMe(req: Request, res: Response): Promise<Response> {
  return sendSuccess(res, { user: sanitizeUser(req.user!) }, 'Current user profile fetched');
}
