import mongoose, { Document, Model } from "mongoose";

export type StudentStatus = "active" | "on_leave" | "graduated" | "suspended";

export interface IStudent extends Document {
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  course: string;
  year: number;
  roomId?: mongoose.Types.ObjectId;
  status: StudentStatus;
  parentPhone?: string;
  address?: string;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new mongoose.Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    rollNo: { type: String, required: true, unique: true, uppercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    course: { type: String, required: true },
    year: { type: Number, required: true, min: 1, max: 5 },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    status: {
      type: String,
      enum: ["active", "on_leave", "graduated", "suspended"],
      default: "active",
    },
    parentPhone: String,
    address: String,
    profilePhoto: String,
  },
  { timestamps: true }
);

// Indexes for fast queries
studentSchema.index({ rollNo: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ roomId: 1 });

export const Student: Model<IStudent> =
  mongoose.models.Student ??
  mongoose.model<IStudent>("Student", studentSchema);