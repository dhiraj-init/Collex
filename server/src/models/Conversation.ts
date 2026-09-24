import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IConversation extends Document {
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  listing: Types.ObjectId;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCountBuyer: number;
  unreadCountSeller: number;
  isBlocked: boolean;
  blockedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing reference is required'],
      index: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCountBuyer: {
      type: Number,
      default: 0,
    },
    unreadCountSeller: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Unique compound index: One conversation per buyer-listing pair
conversationSchema.index({ listing: 1, buyer: 1 }, { unique: true });
conversationSchema.index({ buyer: 1, updatedAt: -1 });
conversationSchema.index({ seller: 1, updatedAt: -1 });

export const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  'Conversation',
  conversationSchema
);
