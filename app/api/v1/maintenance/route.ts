import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import connectDb from "@/lib/db/mongoose";
import { Asset } from "@/lib/models/assert.model"; 
import { PreventiveMaintenance } from "@/lib/models/maintenance.model"; 
import { getSessionPayload } from "@/lib/auth";

const allowedAssetTypes = new Set(["AC", "Geyser", "Water Cooler"]);

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export const POST = asyncHandler(async (req: Request) => {
  const session = await getSessionPayload("admin");

  if (!session || (session.role !== "admin" && session.role !== "warden")) {
    throw new ApiError(403, "Forbidden: Administrative access required");
  }

  await connectDb();

  const body = await req.json();
  const assetId = getString(body.assetId);

  let asset = null;
  let assetIdentifier = getString(body.assetIdentifier);
  let assetType = getString(body.assetType);
  let ageMonths = getNumber(body.ageMonths);
  let daysSinceService = getNumber(body.daysSinceService);
  let floorLevel = getNumber(body.floorLevel);

  if (assetId) {
    asset = await Asset.findById(assetId);
    if (!asset) {
      throw new ApiError(404, "Asset not found");
    }

    const now = new Date();
    const lastMaint = new Date(asset.lastMaintenance);
    const diffTime = Math.abs(now.getTime() - lastMaint.getTime());
    const derivedDaysSinceService = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    assetIdentifier ||= asset._id.toString();
    assetType ||= asset.assetType;
    ageMonths ??= asset.machineAge;
    daysSinceService ??= derivedDaysSinceService;
    floorLevel ??= asset.floor;
  }

  if (!assetIdentifier) {
    throw new ApiError(400, "Asset identifier is required");
  }

  if (!allowedAssetTypes.has(assetType)) {
    throw new ApiError(400, "Valid asset type is required");
  }

  if (
    ageMonths === null ||
    daysSinceService === null ||
    floorLevel === null ||
    ageMonths < 0 ||
    daysSinceService < 0 ||
    floorLevel < 0
  ) {
    throw new ApiError(400, "Age, days since service, and floor level must be valid positive values");
  }

  const usageLoad = assetType === "AC" ? 108 : 5;

  const pythonPayload = {
    asset_id: asset?._id?.toString() || assetIdentifier,
    asset_type: assetType,
    age_months: ageMonths,
    days_since_service: daysSinceService,
    floor_level: floorLevel,
  };

  const pythonApiUrl = process.env.PYTHON_ML_API2_URL || "http://localhost:8000";
  const response = await fetch(`${pythonApiUrl}/predict-failure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pythonPayload),
  });

  if (!response.ok) {
    throw new ApiError(500, "Failed to calculate risk from AI service");
  }

  const predictionData = await response.json();
  const probabilityScore = Number(predictionData.probability_score) || 0;
  const fatal = Boolean(predictionData.alert_required);

  let createdTask = null;
  if (fatal) {
    const existingTask = await PreventiveMaintenance.findOne({
      assetIdentifier,
      status: { $in: ["pending", "scheduled"] }
    });

    if (!existingTask) {
      createdTask = await PreventiveMaintenance.create({
        assetId: asset?._id,
        assetIdentifier,
        assetType,
        ageMonths,
        daysSinceService,
        floorLevel,
        usageLoad,
        riskScore: probabilityScore,
        fatal,
        status: "pending"
      });
    }
  }

  return Response.json(
    new ApiResponse(
      200, 
      {
        ...predictionData,
        asset_identifier: assetIdentifier,
        usage_load: usageLoad,
        fatal,
        taskCreated: !!createdTask,
        storedMaintenanceIssue: !!createdTask,
      }, 
      "Risk calculated successfully"
    ),
    { status: 200 }
  );
});
