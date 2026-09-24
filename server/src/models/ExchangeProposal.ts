/**
 * ExchangeProposal.ts — Phase 10D: Barter
 *
 * Allows users to propose exchanges (item-for-item or item-for-item + cash).
 */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ExchangeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface IExchangeProposal extends Document {
  proposer: Types.ObjectId;
  receiver: Types.ObjectId;
  targetListing: Types.ObjectId;
  offeredListing?: Types.ObjectId;
  offeredItemDescription?: string;
  cashAdjustment?: number; // Positive = proposer adds cash, Negative = receiver adds cash
  status: ExchangeStatus;
  note?: string;
  college: string;
  createdAt: Date;
  updatedAt: Date;
}

const exchangeProposalSchema = new Schema<IExchangeProposal>(
  {
    proposer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetListing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    offeredListing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
    },
    offeredItemDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    cashAdjustment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    college: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ExchangeProposal: Model<IExchangeProposal> = mongoose.model<IExchangeProposal>(
  'ExchangeProposal',
  exchangeProposalSchema
);
