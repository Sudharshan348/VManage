import connectDb from "@/lib/db/mongoose";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import { createStudentSchema } from "@/lib/validation/student";
import { StudentService } from "@/lib/services/student";

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();
  
  const body = await req.json();
  
  const parsedData = createStudentSchema.safeParse(body);
  if (!parsedData.success) {
    throw new ApiError(400, "Invalid student data", parsedData.error.issues);
  }
  
  const profile = await StudentService.createStudentProfile(parsedData.data);
  
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

  const allStudents = await StudentService.getAllStudents();
  
  return Response.json(
    new ApiResponse(200, allStudents, "All students fetched successfully"),
    { status: 200 }
  );
});