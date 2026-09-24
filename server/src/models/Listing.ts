import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ListingCategory =
  | 'TEXTBOOKS'
  | 'ELECTRONICS'
  | 'DORM_ESSENTIALS'
  | 'APPLIANCES'
  | 'FASHION'
  | 'NOTES_STUDY_MATERIAL'
  | 'BICYCLES'
  | 'OTHER';

export type ListingType = 'SELL' | 'RENT' | 'EXCHANGE' | 'FREE';

export type ItemCondition = 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';

export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'ARCHIVED';

export interface IListing extends Document {
  seller: Types.ObjectId;
  college: string;
  title: string;
  description: string;
  category: ListingCategory;
  listingType: ListingType;
  price: number;
  negotiable: boolean;
  originalPrice?: number;
  itemCondition: ItemCondition;
  brand?: string;
  purchaseAge?: string;
  images: string[];
  tags: string[];
  status: ListingStatus;
  viewsCount: number;
  savesCount: number;
  savedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<IListing>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
      index: true,
    },
    college: {
      type: String,
      required: [true, 'College campus is required'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'TEXTBOOKS',
          'ELECTRONICS',
          'DORM_ESSENTIALS',
          'APPLIANCES',
          'FASHION',
          'NOTES_STUDY_MATERIAL',
          'BICYCLES',
          'OTHER',
        ],
        message: 'Invalid listing category',
      },
      index: true,
    },
    listingType: {
      type: String,
      required: [true, 'Listing type is required'],
      enum: {
        values: ['SELL', 'RENT', 'EXCHANGE', 'FREE'],
        message: 'Listing type must be SELL, RENT, EXCHANGE, or FREE',
      },
      default: 'SELL',
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    negotiable: {
      type: Boolean,
      default: false,
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative'],
    },
    itemCondition: {
      type: String,
      required: [true, 'Item condition is required'],
      enum: {
        values: ['BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR'],
        message: 'Condition must be BRAND_NEW, LIKE_NEW, GOOD, or FAIR',
      },
      default: 'GOOD',
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters'],
    },
    purchaseAge: {
      type: String,
      trim: true,
      maxlength: [50, 'Purchase age cannot exceed 50 characters'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 6;
        },
        message: 'Cannot upload more than 6 images per listing',
      },
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'ARCHIVED'],
        message: 'Status must be DRAFT, ACTIVE, RESERVED, SOLD, or ARCHIVED',
      },
      default: 'ACTIVE',
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    savedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

// Compound Indexes for fast campus discovery & sorting
listingSchema.index({ college: 1, status: 1, createdAt: -1 });
listingSchema.index({ college: 1, category: 1, status: 1, price: 1 });
listingSchema.index({ seller: 1, status: 1 });

// Full-text search index across title, description, brand, and tags
listingSchema.index(
  {
    title: 'text',
    description: 'text',
    brand: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      brand: 5,
      tags: 5,
      description: 2,
    },
    name: 'ListingTextIndex',
  }
);

export const Listing: Model<IListing> = mongoose.model<IListing>('Listing', listingSchema);
