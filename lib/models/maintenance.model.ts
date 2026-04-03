import mongoose, { Document, Model } from "mongoose";

export type PreventiveStatus = "pending" | "scheduled" | "completed" | "ignored";

export interface IPreventiveMaintenance extends Document {
  assetId: mongoose.Types.ObjectId;
  riskScore: number; 
  status: PreventiveStatus;
  scheduledDate?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const preventiveMaintenanceSchema = new mongoose.Schema<IPreventiveMaintenance>(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    riskScore: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "completed", "ignored"],
      default: "pending",
    },
    scheduledDate: Date,
    completedAt: Date,
    notes: String,
  },
  { timestamps: true }
);

preventiveMaintenanceSchema.index({ assetId: 1 });
preventiveMaintenanceSchema.index({ status: 1 });

export const PreventiveMaintenance: Model<IPreventiveMaintenance> =
  mongoose.models.PreventiveMaintenance ??
  mongoose.model<IPreventiveMaintenance>("PreventiveMaintenance", preventiveMaintenanceSchema);