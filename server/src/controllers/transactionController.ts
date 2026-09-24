import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { Listing } from '../models/Listing';
import { AppError } from '../utils/appError';

export const APPROVED_SAFE_MEETUP_SPOTS = [
  {
    name: 'Central Library Entrance',
    landmark: 'Under the main porch / security desk',
    recommendedHours: '9:00 AM - 8:00 PM',
  },
  {
    name: 'Student Activity Centre (SAC)',
    landmark: 'Cafeteria entrance foyer',
    recommendedHours: '10:00 AM - 9:00 PM',
  },
  {
    name: 'Main Campus Gate',
    landmark: 'Visitor security booth',
    recommendedHours: '8:00 AM - 10:00 PM',
  },
  {
    name: 'Hostel Quad / Warden Office',
    landmark: 'Common room or security desk',
    recommendedHours: '10:00 AM - 7:00 PM',
  },
];

/**
 * GET /api/v1/transactions/spots
 * List approved public safe campus locations
 */
export function getSafeMeetupSpots(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Approved safe meetup spots fetched',
    data: { spots: APPROVED_SAFE_MEETUP_SPOTS },
  });
}

/**
 * GET /api/v1/transactions/conversation/:conversationId
 * Retrieve transaction state for a conversation
 */
export async function getTransactionByConversation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { conversationId } = req.params;
    const transaction = await Transaction.findOne({ conversation: conversationId })
      .populate('buyer', 'fullName avatar college branch trustScore')
      .populate('seller', 'fullName avatar college branch trustScore')
      .populate('listing', 'title price originalPrice images status');

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Transaction fetched',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/transactions/:id/meetup
 * Update or agree to proposed campus meetup spot and schedule
 */
export async function updateMeetupSpot(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { id } = req.params;
    const { spotName, landmark, scheduledDate } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) throw new AppError(404, 'Transaction not found');

    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller) throw new AppError(403, 'Unauthorized');

    if (spotName) transaction.meetupSpot.name = spotName;
    if (landmark) transaction.meetupSpot.landmark = landmark;
    if (scheduledDate) transaction.meetupSpot.scheduledDate = new Date(scheduledDate);

    if (isBuyer) {
      transaction.meetupSpot.isAgreedByBuyer = true;
    } else {
      transaction.meetupSpot.isAgreedBySeller = true;
    }

    // If both agree, transition to MEETUP_SCHEDULED
    if (transaction.meetupSpot.isAgreedByBuyer && transaction.meetupSpot.isAgreedBySeller) {
      transaction.status = 'MEETUP_SCHEDULED';
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Campus meetup spot updated',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/transactions/:id/confirm
 * Confirm physical handoff and payment settlement
 */
export async function confirmHandoff(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    if (!transaction) throw new AppError(404, 'Transaction not found');

    const isBuyer = transaction.buyer.toString() === req.user._id.toString();
    const isSeller = transaction.seller.toString() === req.user._id.toString();
    if (!isBuyer && !isSeller) throw new AppError(403, 'Unauthorized');

    if (isBuyer) {
      transaction.buyerConfirmedHandoff = true;
    }
    if (isSeller) {
      transaction.sellerConfirmedHandoff = true;
    }

    // When both peers confirm, mark COMPLETED and update listing to SOLD
    if (transaction.buyerConfirmedHandoff && transaction.sellerConfirmedHandoff) {
      transaction.status = 'COMPLETED';
      await Listing.findByIdAndUpdate(transaction.listing, { status: 'SOLD' });
    }

    await transaction.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: transaction.status === 'COMPLETED'
        ? 'Transaction successfully completed! Both peers confirmed physical handoff.'
        : 'Your handoff confirmation has been recorded. Waiting for peer confirmation.',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/transactions/:id/cancel
 * Cancel an active transaction before physical handoff
 */
export async function cancelTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { id } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) throw new AppError(404, 'Transaction not found');

    const isParticipant =
      transaction.buyer.toString() === req.user._id.toString() ||
      transaction.seller.toString() === req.user._id.toString();
    if (!isParticipant) throw new AppError(403, 'Unauthorized');

    transaction.status = 'CANCELLED';
    transaction.cancellationReason = reason || 'Cancelled by student';
    await transaction.save();

    // Re-activate listing
    await Listing.findByIdAndUpdate(transaction.listing, { status: 'ACTIVE' });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Transaction cancelled. Listing re-opened on campus marketplace.',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
}
