import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import connectDb from "@/lib/db/mongoose";
import { RoommateProfile } from "@/lib/models/rommateprofile.model";
import { getSessionPayload } from "@/lib/auth";

export const POST = asyncHandler(async (req: Request) => {
  const session = await getSessionPayload();
  if (!session) {
    throw new ApiError(401, "Unauthorized request");
  }
  if (session.role !== "admin") {
    throw new ApiError(403, "Forbidden: Admin access required");
  }

  await connectDb();
  const body = await req.json();
  const { studentId } = body;

  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
  }

  const targetProfile = await RoommateProfile.findOne({ studentId }).populate({
    path: "studentId",
    populate: { path: "userId" }
  });

  if (!targetProfile) {
    throw new ApiError(404, "Roommate profile not found for this student");
  }

  const targetStudentDoc = targetProfile.studentId as any;
  const poolProfiles = await RoommateProfile.find({
    studentId: { $ne: targetProfile.studentId },
    bedPreference: targetProfile.bedPreference,
    acPreference: targetProfile.acPreference,
  }).populate({
    path: "studentId",
    populate: { path: "userId" }
  });

  const targetStudentPayload = {
    student_id: targetStudentDoc._id.toString(),
    first_name: targetStudentDoc.userId?.firstName || "Student",
    last_name: targetStudentDoc.userId?.lastName || targetStudentDoc.rollNo,
    sleep_schedule: targetProfile.sleepSchedule,
    cleanliness: targetProfile.cleanliness,
    social_battery: targetProfile.socialBattery,
    study_env: targetProfile.studyEnv,
  };

  const studentPoolPayload = poolProfiles.map((profile) => {
    const studentDoc = profile.studentId as any;
    return {
      student_id: studentDoc._id.toString(),
      first_name: studentDoc.userId?.firstName || "Student",
      last_name: studentDoc.userId?.lastName || studentDoc.rollNo,
      sleep_schedule: profile.sleepSchedule,
      cleanliness: profile.cleanliness,
      social_battery: profile.socialBattery,
      study_env: profile.studyEnv,
    };
  });

  const pythonApiUrl = process.env.PYTHON_ML_API_URL || "http://localhost:8000";
  const response = await fetch(`${pythonApiUrl}/calculate-roommates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target_student: targetStudentPayload,
      student_pool: studentPoolPayload,
    }),
  });

  if (!response.ok) {
    throw new ApiError(500, "Failed to calculate matches from AI service");
  }

  const matchData = await response.json();

  return Response.json(
    new ApiResponse(200, matchData.matches, "Roommates matched successfully"),
    { status: 200 }
  );
});