import mongoose, { Document, Model } from "mongoose";

export type NoticeCategory =
  | "general"
  | "maintenance"
  | "event"
  | "rule"
  | "emergency";

export interface INotice extends Document {
  title: string;
  content: string;
  category: NoticeCategory;
  postedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

const noticeSchema = new mongoose.Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["general", "maintenance", "event", "rule", "emergency"],
      default: "general",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    expiresAt: Date,
  },
  { timestamps: true }
);

noticeSchema.index({ isActive: 1, createdAt: -1 });

export const Notice: Model<INotice> =
  mongoose.models.Notice ??
  mongoose.model<INotice>("Notice", noticeSchema);