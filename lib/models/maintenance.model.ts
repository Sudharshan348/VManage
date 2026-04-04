import mongoose, { Document, Model } from "mongoose";

export type PreventiveStatus = "pending" | "scheduled" | "completed" | "ignored";
export type PreventiveAssetType = "AC" | "Geyser" | "Water Cooler";

export interface IPreventiveMaintenance extends Document {
  assetId?: mongoose.Types.ObjectId;
  assetIdentifier: string;
  assetType: PreventiveAssetType;
  ageMonths: number;
  daysSinceService: number;
  floorLevel: number;
  usageLoad: number;
  riskScore: number;
  fatal: boolean;
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
    },
    assetIdentifier: { type: String, required: true, trim: true },
    assetType: {
      type: String,
      enum: ["AC", "Geyser", "Water Cooler"],
      required: true,
    },
    ageMonths: { type: Number, required: true, min: 0 },
    daysSinceService: { type: Number, required: true, min: 0 },
    floorLevel: { type: Number, required: true, min: 0 },
    usageLoad: { type: Number, required: true, min: 0 },
    riskScore: { type: Number, required: true },
    fatal: { type: Boolean, required: true, default: false },
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
preventiveMaintenanceSchema.index({ fatal: 1, createdAt: -1 });

export const PreventiveMaintenance: Model<IPreventiveMaintenance> =
  mongoose.models.PreventiveMaintenance ??
  mongoose.model<IPreventiveMaintenance>("PreventiveMaintenance", preventiveMaintenanceSchema);
