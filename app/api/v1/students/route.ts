import connectDb from "@/lib/db/mongoose";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import { validateStudentSignup } from "@/lib/validation/student";
import { StudentService } from "@/lib/services/student";
import { getSessionPayload } from "@/lib/auth";

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();
  const body = await req.json();
  const validation = validateStudentSignup(body);
  
  if (!validation.success) {
    throw new ApiError(400, validation.message, [validation.fieldErrors]);
  }
  const profile = await StudentService.createStudentProfile(validation.data);
  return Response.json(
    new ApiResponse(201, profile, "Student profile created successfully"),
    { status: 201 }
  );
});

export const GET = asyncHandler(async (req: Request) => {
  await connectDb();
  
  const url = new URL(req.url);
  const identifier = url.searchParams.get("id");
  
  if (identifier) {
    const profile = await StudentService.getStudentProfile(identifier);
    return Response.json(
      new ApiResponse(200, profile, "Student profile fetched successfully"),
      { status: 200 }
    );
  }

  const adminSession = await getSessionPayload("admin");
  if (adminSession?.role === "admin") {
    const allStudents = await StudentService.getAllStudents();
    return Response.json(
      new ApiResponse(200, allStudents, "All students fetched successfully"),
      { status: 200 }
    );
  }

  const studentSession = await getSessionPayload("student");
  if (studentSession?.role === "student") {
    const profile = await StudentService.getStudentProfileByUserId(studentSession._id);
    return Response.json(
      new ApiResponse(200, profile, "Student profile fetched successfully"),
      { status: 200 }
    );
  }

  throw new ApiError(401, "Unauthorized request");
});
