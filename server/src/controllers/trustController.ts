import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Report } from '../models/Report';
import { Review } from '../models/Review';
import { Transaction } from '../models/Transaction';
import { Listing } from '../models/Listing';
import { AppError } from '../utils/appError';
import { calculateTrustScore } from '../utils/trustScore';

/**
 * GET /api/v1/trust/profile/:userId
 * Fetch complete explainable Trust Score and campus badges for a student
 */
export async function getUserTrustProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) throw new AppError(404, 'Student account not found');

    const [reviews, completedDeals, totalDeals, reportsCount] = await Promise.all([
      Review.find({ reviewee: user._id }),
      Transaction.countDocuments({
        $or: [{ buyer: user._id }, { seller: user._id }],
        status: 'COMPLETED',
      }),
      Transaction.countDocuments({
        $or: [{ buyer: user._id }, { seller: user._id }],
      }),
      Report.countDocuments({ reportedUser: user._id, status: 'RESOLVED' }),
    ]);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5.0;

    const breakdown = calculateTrustScore({
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      completedDealsCount: completedDeals,
      totalDealsInitiated: totalDeals,
      averageRating: avgRating,
      reviewCount: reviews.length,
      confirmedReportsCount: reportsCount,
    });

    const memberSinceYear = new Date(user.createdAt).getFullYear();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Trust profile calculated',
      data: {
        userId: user._id,
        fullName: user.fullName,
        college: user.college,
        branch: user.branch,
        trustScore: breakdown.totalScore,
        tier: breakdown.tier,
        tierLabel: breakdown.tierLabel,
        badges: [
          user.verificationStatus === 'STUDENT_VERIFIED'
            ? 'College Verified'
            : user.verificationStatus === 'EMAIL_VERIFIED'
            ? 'Email Verified'
            : 'Unverified',
          `${completedDeals} Successful Deals`,
          reviews.length > 0 ? `${avgRating.toFixed(1)} Seller Rating` : 'New Seller',
          `Member Since ${memberSinceYear}`,
        ],
        signals: breakdown.signals,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/trust/reports
 * Submit a moderation report against a listing or student
 */
export async function createReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { targetType, reportedUserId, reportedListingId, reason, description } = req.body;

    if (!targetType || !reason || !description) {
      throw new AppError(400, 'Target type, reason, and detailed description are required');
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      reportedUser: reportedUserId || undefined,
      reportedListing: reportedListingId || undefined,
      reason,
      description: description.trim(),
      status: 'PENDING',
      auditLog: [
        {
          action: 'REPORT_SUBMITTED',
          performedBy: req.user._id,
          timestamp: new Date(),
          reason: 'Student report filed',
        },
      ],
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Report filed. Thank you for keeping the campus community safe.',
      data: { reportId: report._id },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/trust/moderation
 * Fetch active moderation reports queue (Staff only)
 */
export async function getModerationQueue(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reports = await Report.find()
      .populate('reporter', 'fullName email college')
      .populate('reportedUser', 'fullName email college trustScore')
      .populate('reportedListing', 'title price college status')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Moderation queue fetched',
      data: { reports },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/trust/moderation/:id/resolve
 * Moderator takes action on a report
 */
export async function resolveReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { id } = req.params;
    const { actionTaken = 'NONE', moderatorNotes } = req.body;

    const report = await Report.findById(id);
    if (!report) throw new AppError(404, 'Report not found');

    report.status = actionTaken === 'NONE' ? 'DISMISSED' : 'RESOLVED';
    report.actionTaken = actionTaken;
    report.moderatorNotes = moderatorNotes;
    report.resolvedBy = req.user._id;

    report.auditLog.push({
      action: actionTaken,
      performedBy: req.user._id,
      timestamp: new Date(),
      reason: moderatorNotes || 'Moderator resolution',
    });

    // Execute action
    if (actionTaken === 'LISTING_REMOVED' && report.reportedListing) {
      await Listing.findByIdAndUpdate(report.reportedListing, { status: 'ARCHIVED' });
    }

    await report.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Report resolved with action: ${actionTaken}`,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
}
