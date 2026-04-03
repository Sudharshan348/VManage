import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import connectDb from "@/lib/db/mongoose";
import { Asset } from "@/lib/models/assert.model"; 
import { PreventiveMaintenance } from "@/lib/models/maintenance.model"; 
import { getSessionPayload } from "@/lib/auth";

export const POST = asyncHandler(async (req: Request) => {
  const session = await getSessionPayload();

  if (!session || (session.role !== "admin" && session.role !== "warden")) {
    throw new ApiError(403, "Forbidden: Administrative access required");
  }

  await connectDb();

  const body = await req.json();
  const { assetId } = body;

  if (!assetId) {
    throw new ApiError(400, "Asset ID is required");
  }

  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError(404, "Asset not found");
  }

  const now = new Date();
  const lastMaint = new Date(asset.lastMaintenance);
  const diffTime = Math.abs(now.getTime() - lastMaint.getTime());
  const daysSinceService = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const pythonPayload = {
    asset_id: asset._id.toString(),
    asset_type: asset.assetType,
    age_months: asset.machineAge,
    days_since_service: daysSinceService,
    floor_level: asset.floor,
  };

  const pythonApiUrl = process.env.PYTHON_ML_API_URL || "http://localhost:8000";
  const response = await fetch(`${pythonApiUrl}/predict-failure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pythonPayload),
  });

  if (!response.ok) {
    throw new ApiError(500, "Failed to calculate risk from AI service");
  }

  const predictionData = await response.json();

  let createdTask = null;
  if (predictionData.alert_required) {
    const existingTask = await PreventiveMaintenance.findOne({
      assetId: asset._id,
      status: { $in: ["pending", "scheduled"] }
    });

    if (!existingTask) {
      createdTask = await PreventiveMaintenance.create({
        assetId: asset._id,
        riskScore: predictionData.probability_score,
        status: "pending"
      });
    }
  }

  return Response.json(
    new ApiResponse(
      200, 
      { ...predictionData, taskCreated: !!createdTask }, 
      "Risk calculated successfully"
    ),
    { status: 200 }
  );
});