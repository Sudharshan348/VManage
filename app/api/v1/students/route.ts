import { getSessionPayload } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Student } from "@/lib/models/student.model";
import { User } from "@/lib/models/user.model";
import { ApiError } from "@/lib/util/apierror";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";

export const GET = asyncHandler(async () => {
  await connectDb();

  const session = await getSessionPayload();
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }

  if (session.role === "student") {
    const user = await User.findById(session._id).select("studentId email").lean();
    const student = user?.studentId
      ? await Student.findById(user.studentId).lean()
      : await Student.findOne({ email: user?.email }).lean();

    return Response.json(
      new ApiResponse(200, student, "Student fetched successfully"),
      { status: 200 }
    );
  }

  const students = await Student.find().sort({ createdAt: -1 }).lean();

  return Response.json(
    new ApiResponse(200, students, "Students fetched successfully"),
    { status: 200 }
  );
});
