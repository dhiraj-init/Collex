import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type MessageType =
  | 'TEXT'
  | 'OFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'OFFER_COUNTER'
  | 'SYSTEM';

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  text: string;
  type: MessageType;
  offer?: {
    price: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED';
    counterPrice?: number;
  };
  readBy: Types.ObjectId[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation is required'],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      enum: ['TEXT', 'OFFER', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'OFFER_COUNTER', 'SYSTEM'],
      default: 'TEXT',
    },
    offer: {
      price: { type: Number },
      status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'],
        default: 'PENDING',
      },
      counterPrice: { type: Number },
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
