import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Listing } from '../models/Listing';
import { Report } from '../models/Report';
import { AppError } from '../utils/appError';

/**
 * POST /api/v1/chat/conversations
 * Get existing or create new conversation for a listing
 */
export async function getOrCreateConversation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { listingId } = req.body;
    if (!listingId) throw new AppError(400, 'Listing ID is required');

    const listing = await Listing.findById(listingId);
    if (!listing) throw new AppError(404, 'Marketplace listing not found');

    const buyerId = req.user._id;
    const sellerId = listing.seller;

    if (buyerId.toString() === sellerId.toString()) {
      throw new AppError(400, 'Cannot initiate conversation with your own listing');
    }

    let conversation = await Conversation.findOne({
      listing: listing._id,
      buyer: buyerId,
    })
      .populate('buyer', 'fullName avatar college branch trustScore verificationStatus')
      .populate('seller', 'fullName avatar college branch trustScore verificationStatus')
      .populate('listing', 'title price originalPrice images status college');

    if (!conversation) {
      conversation = await Conversation.create({
        buyer: buyerId,
        seller: sellerId,
        listing: listing._id,
        lastMessage: `Hi! Is "${listing.title}" still available?`,
        lastMessageAt: new Date(),
        unreadCountBuyer: 0,
        unreadCountSeller: 1,
      });

      // Seed initial greeting message
      await Message.create({
        conversation: conversation._id,
        sender: buyerId,
        text: `Hi! Is "${listing.title}" still available?`,
        type: 'TEXT',
        readBy: [buyerId],
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('buyer', 'fullName avatar college branch trustScore verificationStatus')
        .populate('seller', 'fullName avatar college branch trustScore verificationStatus')
        .populate('listing', 'title price originalPrice images status college');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Conversation retrieved',
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/chat/conversations
 * Retrieve all active conversations for the authenticated student
 */
export async function getConversations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate('buyer', 'fullName avatar college branch trustScore verificationStatus')
      .populate('seller', 'fullName avatar college branch trustScore verificationStatus')
      .populate('listing', 'title price originalPrice images status college')
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Conversations fetched',
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/chat/conversations/:id/messages
 * Retrieve messages for a conversation
 */
export async function getMessages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) throw new AppError(404, 'Conversation not found');

    const isParticipant =
      conversation.buyer.toString() === req.user._id.toString() ||
      conversation.seller.toString() === req.user._id.toString();

    if (!isParticipant) {
      throw new AppError(403, 'Unauthorized access to conversation messages');
    }

    const messages = await Message.find({ conversation: id })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Messages fetched',
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/chat/conversations/:id/block
 * Block user and prevent further messaging in conversation
 */
export async function blockConversation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) throw new AppError(404, 'Conversation not found');

    conversation.isBlocked = true;
    conversation.blockedBy = req.user._id;
    await conversation.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User blocked. You will no longer receive messages in this thread.',
      data: { conversationId: id, isBlocked: true },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/chat/conversations/:id/report
 * Report a conversation for harassment, spam, or scam attempt
 */
export async function reportConversation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Authentication required');

    const { id } = req.params;
    const { reason, description } = req.body;

    if (!reason || !description) {
      throw new AppError(400, 'Reason and description are required for reporting');
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) throw new AppError(404, 'Conversation not found');

    const otherUserId =
      conversation.buyer.toString() === req.user._id.toString()
        ? conversation.seller
        : conversation.buyer;

    const report = await Report.create({
      reporter: req.user._id,
      targetType: 'CONVERSATION',
      reportedUser: otherUserId,
      conversation: conversation._id,
      reason,
      description: description.trim(),
      status: 'PENDING',
      auditLog: [
        {
          action: 'REPORT_SUBMITTED',
          performedBy: req.user._id,
          timestamp: new Date(),
          reason: 'Initial student submission',
        },
      ],
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Report submitted to campus safety moderators for urgent review.',
      data: { reportId: report._id },
    });
  } catch (error) {
    next(error);
  }
}
