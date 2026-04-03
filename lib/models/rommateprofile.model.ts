import mongoose, { Document, Model } from "mongoose";

export interface IRoommateProfile extends Document {
  studentId: mongoose.Types.ObjectId;
  sleepSchedule: number;
  cleanliness: number;
  socialBattery: number;
  studyEnv: number;
  bedPreference: "two" | "three" | "four" | "six";
  acPreference: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roommateProfileSchema = new mongoose.Schema<IRoommateProfile>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true,
    },
    sleepSchedule: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, required: true, min: 1, max: 5 },
    socialBattery: { type: Number, required: true, min: 1, max: 5 },
    studyEnv: { type: Number, required: true, min: 1, max: 5 },
    bedPreference: {
      type: String,
      enum: ["two", "three", "four", "six"],
      required: true,
    },
    acPreference: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const RoommateProfile: Model<IRoommateProfile> =
  mongoose.models.RoommateProfile ??
  mongoose.model<IRoommateProfile>("RoommateProfile", roommateProfileSchema);