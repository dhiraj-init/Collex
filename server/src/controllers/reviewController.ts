import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { calculateTrustScore } from '../utils/trustScore';

/**
 * POST /api/v1/reviews
 * Submit peer review after completed campus meetup
 */
export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { transactionId, rating, comment, punctual = true, itemAsDescribed = true } = req.body;

    if (!transactionId || !rating || !comment) {
      throw new AppError(400, 'Transaction ID, rating (1-5), and comment are required');
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) throw new AppError(404, 'Transaction not found');

    if (transaction.status !== 'COMPLETED') {
      throw new AppError(400, 'Reviews can only be submitted for completed transactions');
    }

    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller) throw new AppError(403, 'Unauthorized');

    const revieweeId = isBuyer ? transaction.seller : transaction.buyer;

    // Check if review already exists
    const existing = await Review.findOne({
      transaction: transaction._id,
      reviewer: req.user._id,
    });
    if (existing) {
      throw new AppError(400, 'You have already submitted a review for this transaction');
    }

    const review = await Review.create({
      transaction: transaction._id,
      listing: transaction.listing,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: Number(rating),
      comment: comment.trim(),
      punctual: Boolean(punctual),
      itemAsDescribed: Boolean(itemAsDescribed),
    });

    // Recalculate recipient's Trust Score
    const reviewee = await User.findById(revieweeId);
    if (reviewee) {
      const allReviews = await Review.find({ reviewee: revieweeId });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      const completedDeals = await Transaction.countDocuments({
        $or: [{ buyer: revieweeId }, { seller: revieweeId }],
        status: 'COMPLETED',
      });

      const totalDeals = await Transaction.countDocuments({
        $or: [{ buyer: revieweeId }, { seller: revieweeId }],
      });

      const scoreResult = calculateTrustScore({
        verificationStatus: reviewee.verificationStatus,
        createdAt: reviewee.createdAt,
        completedDealsCount: completedDeals,
        totalDealsInitiated: totalDeals,
        averageRating: avgRating,
        reviewCount: allReviews.length,
        confirmedReportsCount: 0,
      });

      reviewee.trustScore = scoreResult.totalScore;
      await reviewee.save();
    }

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Peer review submitted successfully. Thank you for building campus trust!',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/reviews/user/:userId
 * Fetch reviews received by a student
 */
export async function getUserReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'fullName avatar college branch')
      .populate('listing', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 5.0;

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Student reviews fetched',
      data: {
        reviews,
        stats: {
          totalReviews: reviews.length,
          averageRating: Number(avgRating.toFixed(1)),
          punctualityRate: reviews.length > 0
            ? Math.round((reviews.filter((r) => r.punctual).length / reviews.length) * 100)
            : 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
