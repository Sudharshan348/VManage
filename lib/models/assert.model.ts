import mongoose, { Document, Model } from "mongoose";

export type AssetType = "AC" | "Geyser" | "Water Cooler";

export interface IAsset extends Document {
  assetType: AssetType;
  floor: number;
  machineAge: number;
  lastMaintenance: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new mongoose.Schema<IAsset>(
  {
    assetType: {
      type: String,
      enum: ["AC","Geyser","Water Cooler"],
      required: true,
    },
    floor: { type: Number, required: true },
    machineAge: { type: Number, required: true },
    lastMaintenance: { type: Date, required: true },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

export const Asset: Model<IAsset> =
  mongoose.models.Asset ?? mongoose.model<IAsset>("Asset", assetSchema);