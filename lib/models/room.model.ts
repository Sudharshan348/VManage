import mongoose, { Document, Model } from "mongoose";

export type RoomStatus = "available" | "full" | "maintenance";
export type RoomType = "two" | "three" | "four" | "six" ;

export interface IRoom extends Document {
  roomNumber: string;
  block: string;
  floor: number;
  type: RoomType;
  capacity: number;
  currentOccupancy: number;
  status: RoomStatus;
  amenities: string[];
  createdAt: Date;
}

const roomSchema = new mongoose.Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    block: { type: String, required: true, uppercase: true },
    floor: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["two","three","four","six"],
      required: true,
    },
    capacity: { type: Number, required: true, min: 2 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["available", "full", "maintenance"],
      default: "available",
    },
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

// No next() needed — synchronous logic, just use a regular pre hook
roomSchema.pre("save", function () {
  if (this.currentOccupancy >= this.capacity) {
    this.status = "full";
  } else if (this.status !== "maintenance") {
    this.status = "available";
  }
});

roomSchema.index({ block: 1, floor: 1 });
roomSchema.index({ status: 1 });

export const Room: Model<IRoom> =
  mongoose.models.Room ?? mongoose.model<IRoom>("Room", roomSchema);