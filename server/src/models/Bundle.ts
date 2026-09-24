/**
 * Bundle.ts — Phase 10B: Graduation Mode & Campus Bundles
 *
 * Allows graduating seniors to bundle their entire dorm room / semester items
 * into a single "Leaving Campus Sale" collection with an all-in-one discount.
 * Also supports curated starter bundles (Freshers Mode).
 */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type BundleType = 'GRADUATION_SALE' | 'HOSTEL_ESSENTIALS' | 'SEMESTER_PACK' | 'CUSTOM';
export type BundleStatus = 'ACTIVE' | 'SOLD' | 'ARCHIVED';

export interface IBundle extends Document {
  title: string;
  description: string;
  seller: Types.ObjectId;
  college: string;
  listings: Types.ObjectId[];
  bundlePrice: number;
  totalOriginalPrice?: number;
  discountPercentage?: number;
  bundleType: BundleType;
  isGraduationSale: boolean;
  graduationYear?: number;
  status: BundleStatus;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const bundleSchema = new Schema<IBundle>(
  {
    title: {
      type: String,
      required: [true, 'Bundle title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
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
      trim: true,
      index: true,
    },
    listings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
      },
    ],
    bundlePrice: {
      type: Number,
      required: [true, 'Bundle price is required'],
      min: [0, 'Bundle price cannot be negative'],
    },
    totalOriginalPrice: {
      type: Number,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    bundleType: {
      type: String,
      enum: ['GRADUATION_SALE', 'HOSTEL_ESSENTIALS', 'SEMESTER_PACK', 'CUSTOM'],
      default: 'GRADUATION_SALE',
      index: true,
    },
    isGraduationSale: {
      type: Boolean,
      default: true,
      index: true,
    },
    graduationYear: {
      type: Number,
      min: 2020,
      max: 2035,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SOLD', 'ARCHIVED'],
      default: 'ACTIVE',
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
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

bundleSchema.index({ college: 1, status: 1, createdAt: -1 });

export const Bundle: Model<IBundle> = mongoose.model<IBundle>('Bundle', bundleSchema);
