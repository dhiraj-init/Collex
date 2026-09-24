/**
 * WantedPost.ts — Phase 10A: Wanted Board
 *
 * Students can post "Looking for X" requests.
 * Sellers can respond with listings or direct messages.
 *
 * This is a pull-market feature that complements the push-market
 * of traditional listings.
 */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ListingCategory } from './Listing';

export type WantedStatus = 'OPEN' | 'FULFILLED' | 'EXPIRED' | 'CLOSED';

export interface IWantedPost extends Document {
  poster: Types.ObjectId;
  college: string;
  title: string;                   // e.g. "Looking for Casio FX-991ES"
  description?: string;
  category: ListingCategory;
  budgetMin?: number;
  budgetMax?: number;
  preferredConditions: string[];   // ['LIKE_NEW', 'GOOD']
  status: WantedStatus;
  responseCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const wantedPostSchema = new Schema<IWantedPost>(
  {
    poster: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    college: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: ['TEXTBOOKS', 'ELECTRONICS', 'DORM_ESSENTIALS', 'APPLIANCES', 'FASHION', 'NOTES_STUDY_MATERIAL', 'BICYCLES', 'OTHER'],
    },
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    preferredConditions: {
      type: [String],
      default: [],
      enum: ['BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'FULFILLED', 'EXPIRED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    responseCount: { type: Number, default: 0, min: 0 },
    // Auto-expire after 30 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
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

wantedPostSchema.index({ college: 1, status: 1, createdAt: -1 });
wantedPostSchema.index({ college: 1, category: 1, status: 1 });

export const WantedPost: Model<IWantedPost> = mongoose.model<IWantedPost>('WantedPost', wantedPostSchema);
