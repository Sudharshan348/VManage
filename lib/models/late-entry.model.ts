import mongoose, { Document, Model } from "mongoose";

export interface ILateEntry extends Document {
  studentId: mongoose.Types.ObjectId;
  entryTime: Date;
  reason: string;
  approvedBy?: string;
  isFlagged: boolean;
  note?: string;
  createdAt: Date;
}

const lateEntrySchema = new mongoose.Schema<ILateEntry>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    entryTime: { type: Date, required: true },
    reason: { type: String, required: true },
    approvedBy: String,
    isFlagged: { type: Boolean, default: false },
    note: String,
  },
  { timestamps: true }
);

// Synchronous — no next() needed
lateEntrySchema.pre("save", function () {
  const hour = new Date(this.entryTime).getHours();
  if (hour >= 23 || hour < 5) {
    this.isFlagged = true;
  }
});

lateEntrySchema.index({ studentId: 1, createdAt: -1 });

export const LateEntry: Model<ILateEntry> =
  mongoose.models.LateEntry ??
  mongoose.model<ILateEntry>("LateEntry", lateEntrySchema);