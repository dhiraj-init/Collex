import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  transaction: Types.ObjectId;
  listing: Types.ObjectId;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  rating: number;
  comment: string;
  punctual: boolean;
  itemAsDescribed: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    punctual: {
      type: Boolean,
      default: true,
    },
    itemAsDescribed: {
      type: Boolean,
      default: true,
    },
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

// One review per reviewer per transaction
reviewSchema.index({ transaction: 1, reviewer: 1 }, { unique: true });

export const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);
