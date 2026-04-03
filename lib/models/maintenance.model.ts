import mongoose, { Document, Model } from "mongoose";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
  | "plumbing"
  | "electrical"
  | "furniture"
  | "cleaning"
  | "internet"
  | "other";

export interface IMaintenanceTicket extends Document {
  studentId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  resolvedAt?: Date;
  resolvedNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new mongoose.Schema<IMaintenanceTicket>(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["plumbing", "electrical", "furniture", "cleaning", "internet", "other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: String,
    resolvedAt: Date,
    resolvedNote: String,
  },
  { timestamps: true }
);

maintenanceSchema.index({ studentId: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ createdAt: -1 });

export const MaintenanceTicket: Model<IMaintenanceTicket> =
  mongoose.models.MaintenanceTicket ??
  mongoose.model<IMaintenanceTicket>("MaintenanceTicket", maintenanceSchema);