import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type TransactionStatus =
  | 'AGREED'
  | 'MEETUP_SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface ITransaction extends Document {
  conversation: Types.ObjectId;
  listing: Types.ObjectId;
  buyer: Types.ObjectId;
  seller: Types.ObjectId;
  college: string;
  agreedPrice: number;
  status: TransactionStatus;
  meetupSpot: {
    name: string;
    landmark?: string;
    scheduledDate?: Date;
    isAgreedByBuyer: boolean;
    isAgreedBySeller: boolean;
  };
  buyerConfirmedHandoff: boolean;
  sellerConfirmedHandoff: boolean;
  cancellationReason?: string;
  disputeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    college: {
      type: String,
      required: true,
      index: true,
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['AGREED', 'MEETUP_SCHEDULED', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
      default: 'AGREED',
      index: true,
    },
    meetupSpot: {
      name: {
        type: String,
        default: 'Central Library Entrance',
      },
      landmark: {
        type: String,
      },
      scheduledDate: {
        type: Date,
      },
      isAgreedByBuyer: {
        type: Boolean,
        default: false,
      },
      isAgreedBySeller: {
        type: Boolean,
        default: false,
      },
    },
    buyerConfirmedHandoff: {
      type: Boolean,
      default: false,
    },
    sellerConfirmedHandoff: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
    },
    disputeReason: {
      type: String,
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

transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  'Transaction',
  transactionSchema
);
