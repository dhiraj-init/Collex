import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type ReportReason =
  | 'INAPPROPRIATE_ITEM'
  | 'SCAM_SUSPICION'
  | 'HARASSMENT'
  | 'NO_SHOW'
  | 'PROHIBITED_GOODS'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface IReport extends Document {
  reporter: Types.ObjectId;
  targetType: 'LISTING' | 'USER' | 'CONVERSATION';
  reportedUser?: Types.ObjectId;
  reportedListing?: Types.ObjectId;
  conversation?: Types.ObjectId;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  moderatorNotes?: string;
  actionTaken?: 'NONE' | 'LISTING_REMOVED' | 'USER_WARNED' | 'ACCOUNT_SUSPENDED';
  resolvedBy?: Types.ObjectId;
  auditLog: Array<{
    action: string;
    performedBy: Types.ObjectId;
    timestamp: Date;
    reason: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['LISTING', 'USER', 'CONVERSATION'],
      required: true,
    },
    reportedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reportedListing: {
      type: Schema.Types.ObjectId,
      ref: 'Listing',
      index: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    reason: {
      type: String,
      enum: [
        'INAPPROPRIATE_ITEM',
        'SCAM_SUSPICION',
        'HARASSMENT',
        'NO_SHOW',
        'PROHIBITED_GOODS',
        'OTHER',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
    moderatorNotes: {
      type: String,
      trim: true,
    },
    actionTaken: {
      type: String,
      enum: ['NONE', 'LISTING_REMOVED', 'USER_WARNED', 'ACCOUNT_SUSPENDED'],
      default: 'NONE',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    auditLog: [
      {
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        reason: { type: String, required: true },
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

reportSchema.index({ status: 1, createdAt: -1 });

export const Report: Model<IReport> = mongoose.model<IReport>('Report', reportSchema);
