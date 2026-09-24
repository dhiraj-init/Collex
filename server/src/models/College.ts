/**
 * College.ts — Phase 11: Multi-Tenancy
 * Each College is an independent tenant with its own domain, branding,
 * settings, approved meetup spots, and moderation configuration.
 *
 * Tenant isolation is enforced at the query level:
 * every resource query filters by `college` slug or domain.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMeetupSpot {
  name: string;
  description: string;
  isActive: boolean;
}

export interface ICollegeSettings {
  allowRentals: boolean;
  allowExchange: boolean;
  maxListingsPerStudent: number;
  requireStudentVerification: boolean;
}

export interface ICollege extends Document {
  name: string;
  slug: string;                  // URL-safe: e.g. "wce"  -> collex.in/campus/wce
  emailDomains: string[];        // e.g. ["wce.edu.in"]
  logo?: string;
  website?: string;
  city: string;
  state: string;
  approvedMeetupSpots: IMeetupSpot[];
  settings: ICollegeSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const meetupSpotSchema = new Schema<IMeetupSpot>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const settingsSchema = new Schema<ICollegeSettings>(
  {
    allowRentals: { type: Boolean, default: true },
    allowExchange: { type: Boolean, default: true },
    maxListingsPerStudent: { type: Number, default: 20, min: 1 },
    requireStudentVerification: { type: Boolean, default: false },
  },
  { _id: false }
);

const collegeSchema = new Schema<ICollege>(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
      maxlength: [120, 'College name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'URL slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
      index: true,
    },
    emailDomains: {
      type: [String],
      required: [true, 'At least one email domain is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one email domain must be provided',
      },
    },
    logo: { type: String },
    website: { type: String },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    approvedMeetupSpots: {
      type: [meetupSpotSchema],
      default: [
        { name: 'Central Library', description: 'Main library entrance — well-lit and busy', isActive: true },
        { name: 'Student Activity Centre', description: 'SAC ground floor lobby', isActive: true },
        { name: 'Main Gate Security Post', description: 'Staffed 24/7 — visible to security', isActive: true },
        { name: 'Department Lobby', description: 'Ground floor of your department building', isActive: true },
        { name: 'Hostel Warden Office', description: 'Hostel office corridor — always supervised', isActive: true },
      ],
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    isActive: { type: Boolean, default: true, index: true },
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

// Ensure email domain lookups are fast
collegeSchema.index({ emailDomains: 1 });

export const College: Model<ICollege> = mongoose.model<ICollege>('College', collegeSchema);
