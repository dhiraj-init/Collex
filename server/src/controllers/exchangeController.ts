/**
 * exchangeController.ts — Phase 10D: Barter
 */
import { Request, Response, NextFunction } from 'express';
import { ExchangeProposal } from '../models/ExchangeProposal';
import { Listing } from '../models/Listing';
import { AppError } from '../utils/appError';
import { sendSuccess } from '../utils/apiResponse';

export async function createProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { targetListing, offeredListing, offeredItemDescription, cashAdjustment, note } = req.body as Record<string, unknown>;

    if (!targetListing || (!offeredListing && !offeredItemDescription)) {
      return next(new AppError('Target listing and an offered item are required', 400));
    }

    const target = await Listing.findById(targetListing);
    if (!target) return next(new AppError('Target listing not found', 404));

    if (String(target.seller) === String(req.user!._id)) {
      return next(new AppError('You cannot propose an exchange on your own listing', 400));
    }

    if (target.college !== req.user!.college) {
      return next(new AppError('Cross-campus exchanges are not supported', 403));
    }

    const proposal = await ExchangeProposal.create({
      proposer: req.user!._id,
      receiver: target.seller,
      college: req.user!.college,
      targetListing,
      offeredListing,
      offeredItemDescription,
      cashAdjustment: cashAdjustment ?? 0,
      note,
    });

    sendSuccess(res, { proposal }, 'Exchange proposal sent successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyProposals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;

    const [sent, received] = await Promise.all([
      ExchangeProposal.find({ proposer: userId })
        .populate('receiver', 'fullName avatar')
        .populate('targetListing', 'title images price')
        .populate('offeredListing', 'title images price')
        .sort({ createdAt: -1 }),
      ExchangeProposal.find({ receiver: userId })
        .populate('proposer', 'fullName avatar trustScore')
        .populate('targetListing', 'title images price')
        .populate('offeredListing', 'title images price')
        .sort({ createdAt: -1 }),
    ]);

    sendSuccess(res, { sent, received });
  } catch (err) {
    next(err);
  }
}

export async function respondToProposal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { action } = req.body as { action: 'ACCEPT' | 'REJECT' };

    if (!['ACCEPT', 'REJECT'].includes(action)) {
      return next(new AppError('Action must be ACCEPT or REJECT', 400));
    }

    const proposal = await ExchangeProposal.findById(id);
    if (!proposal) return next(new AppError('Proposal not found', 404));

    if (String(proposal.receiver) !== String(req.user!._id)) {
      return next(new AppError('Only the receiver can respond to this proposal', 403));
    }

    if (proposal.status !== 'PENDING') {
      return next(new AppError(`Proposal is already ${proposal.status}`, 400));
    }

    proposal.status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    await proposal.save();

    // If accepted, we might want to also create a real Transaction here automatically.
    // For now, accepting it just signals agreement.

    sendSuccess(res, { proposal }, `Proposal ${proposal.status.toLowerCase()}`);
  } catch (err) {
    next(err);
  }
}
