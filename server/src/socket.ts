import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken, TokenPayload } from './utils/token';
import { Conversation } from './models/Conversation';
import { Message } from './models/Message';
import { Transaction } from './models/Transaction';
import { Listing } from './models/Listing';
import { logger } from './utils/logger';

interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export function setupSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // 1. Socket.IO Authentication Middleware
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('Authentication token required for real-time messaging'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  // 2. Real-Time Connection Event Handlers
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect();
      return;
    }

    logger.info(`[Socket] Student connected: ${user.email} (${socket.id})`);

    // Join personal user room for direct inbox/system alerts
    socket.join(`user:${user.userId}`);

    // Join specific conversation room with strict membership verification
    socket.on('join_conversation', async ({ conversationId }: { conversationId: string }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('socket_error', { message: 'Conversation not found' });
          return;
        }

        const isParticipant =
          conversation.buyer.toString() === user.userId ||
          conversation.seller.toString() === user.userId;

        if (!isParticipant) {
          socket.emit('socket_error', {
            message: 'Unauthorized: You are not a participant in this conversation',
          });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        logger.info(`[Socket] User ${user.email} joined conversation room: ${conversationId}`);
      } catch (err) {
        socket.emit('socket_error', { message: 'Failed to join conversation room' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Send Real-Time Message or Offer
    socket.on(
      'send_message',
      async ({
        conversationId,
        text,
        type = 'TEXT',
        offerPrice,
      }: {
        conversationId: string;
        text: string;
        type?: 'TEXT' | 'OFFER';
        offerPrice?: number;
      }) => {
        try {
          const conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            socket.emit('socket_error', { message: 'Conversation not found' });
            return;
          }

          const isBuyer = conversation.buyer.toString() === user.userId;
          const isSeller = conversation.seller.toString() === user.userId;
          if (!isBuyer && !isSeller) {
            socket.emit('socket_error', { message: 'Unauthorized' });
            return;
          }

          if (conversation.isBlocked) {
            socket.emit('socket_error', { message: 'Cannot send messages in a blocked conversation' });
            return;
          }

          // Create message record
          const messageData: Record<string, unknown> = {
            conversation: conversation._id,
            sender: user.userId,
            text: text.trim(),
            type,
            readBy: [user.userId],
          };

          if (type === 'OFFER' && offerPrice) {
            messageData.offer = {
              price: Number(offerPrice),
              status: 'PENDING',
            };
          }

          const newMessage = await Message.create(messageData);
          const populated = await Message.findById(newMessage._id).populate(
            'sender',
            'fullName avatar college'
          );

          // Update conversation last message & unread count for recipient
          conversation.lastMessage = text.trim();
          conversation.lastMessageAt = new Date();
          if (isBuyer) {
            conversation.unreadCountSeller += 1;
          } else {
            conversation.unreadCountBuyer += 1;
          }
          await conversation.save();

          // Broadcast to conversation room
          io.to(`conversation:${conversationId}`).emit('new_message', populated);

          // Alert recipient's inbox room in real time
          const recipientId = isBuyer ? conversation.seller.toString() : conversation.buyer.toString();
          io.to(`user:${recipientId}`).emit('conversation_updated', {
            conversationId: conversation._id,
            lastMessage: text.trim(),
            lastMessageAt: conversation.lastMessageAt,
            sender: user.fullName,
          });
        } catch (err) {
          socket.emit('socket_error', { message: 'Failed to dispatch message' });
        }
      }
    );

    // Respond to an Offer (ACCEPT / REJECT / COUNTER)
    socket.on(
      'respond_offer',
      async ({
        conversationId,
        messageId,
        action,
        counterPrice,
      }: {
        conversationId: string;
        messageId: string;
        action: 'ACCEPT' | 'REJECT' | 'COUNTER';
        counterPrice?: number;
      }) => {
        try {
          const [conversation, message] = await Promise.all([
            Conversation.findById(conversationId).populate('listing'),
            Message.findById(messageId),
          ]);

          if (!conversation || !message || !message.offer) {
            socket.emit('socket_error', { message: 'Offer or conversation not found' });
            return;
          }

          const isParticipant =
            conversation.buyer.toString() === user.userId ||
            conversation.seller.toString() === user.userId;
          if (!isParticipant) {
            socket.emit('socket_error', { message: 'Unauthorized' });
            return;
          }

          if (action === 'ACCEPT') {
            message.offer.status = 'ACCEPTED';
            await message.save();

            // 1. Create or retrieve active Transaction in AGREED state
            const agreedPrice = message.offer.counterPrice || message.offer.price;
            const transaction = await Transaction.create({
              conversation: conversation._id,
              listing: conversation.listing,
              buyer: conversation.buyer,
              seller: conversation.seller,
              college: user.college,
              agreedPrice,
              status: 'AGREED',
              meetupSpot: {
                name: 'Central Library Entrance',
                isAgreedByBuyer: false,
                isAgreedBySeller: false,
              },
            });

            // 2. Mark listing as RESERVED
            await Listing.findByIdAndUpdate(conversation.listing, { status: 'RESERVED' });

            // 3. System message
            const systemMsg = await Message.create({
              conversation: conversation._id,
              sender: user.userId,
              type: 'OFFER_ACCEPTED',
              text: `🎉 Offer of ₹${agreedPrice.toLocaleString('en-IN')} was accepted by ${user.fullName}! Physical meetup transaction initiated.`,
              readBy: [user.userId],
            });

            io.to(`conversation:${conversationId}`).emit('offer_resolved', {
              messageId,
              status: 'ACCEPTED',
              transaction,
            });
            io.to(`conversation:${conversationId}`).emit('new_message', systemMsg);
          } else if (action === 'REJECT') {
            message.offer.status = 'REJECTED';
            await message.save();

            const systemMsg = await Message.create({
              conversation: conversation._id,
              sender: user.userId,
              type: 'OFFER_REJECTED',
              text: `Offer of ₹${message.offer.price.toLocaleString('en-IN')} was declined.`,
              readBy: [user.userId],
            });

            io.to(`conversation:${conversationId}`).emit('offer_resolved', {
              messageId,
              status: 'REJECTED',
            });
            io.to(`conversation:${conversationId}`).emit('new_message', systemMsg);
          } else if (action === 'COUNTER' && counterPrice) {
            message.offer.status = 'COUNTERED';
            message.offer.counterPrice = Number(counterPrice);
            await message.save();

            const counterMsg = await Message.create({
              conversation: conversation._id,
              sender: user.userId,
              type: 'OFFER_COUNTER',
              text: `Counter-offer proposed: ₹${Number(counterPrice).toLocaleString('en-IN')}`,
              offer: {
                price: Number(counterPrice),
                status: 'PENDING',
              },
              readBy: [user.userId],
            });

            io.to(`conversation:${conversationId}`).emit('offer_resolved', {
              messageId,
              status: 'COUNTERED',
              counterPrice: Number(counterPrice),
            });
            io.to(`conversation:${conversationId}`).emit('new_message', counterMsg);
          }
        } catch (err) {
          socket.emit('socket_error', { message: 'Failed to update offer' });
        }
      }
    );

    // Typing Indicators
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: user.userId,
        userName: user.fullName,
      });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
        userId: user.userId,
      });
    });

    // Mark Messages As Read
    socket.on('mark_read', async ({ conversationId }: { conversationId: string }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        if (conversation.buyer.toString() === user.userId) {
          conversation.unreadCountBuyer = 0;
        } else if (conversation.seller.toString() === user.userId) {
          conversation.unreadCountSeller = 0;
        }
        await conversation.save();

        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: user.userId,
        });
      } catch {
        // Non-blocking read acknowledgement
      }
    });

    socket.on('disconnect', () => {
      logger.info(`[Socket] Student disconnected: ${user.email}`);
    });
  });

  return io;
}
