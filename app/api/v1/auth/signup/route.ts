import connectDb from "@/lib/db/mongoose";
import { ApiError } from "@/lib/util/apierror";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { StudentService } from "@/lib/services/student";
import { validateStudentSignup } from "@/lib/validation/student";

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();

  const body = await req.json();
  const parsed = validateStudentSignup(body);

  if (!parsed.success) {
    throw new ApiError(400, parsed.message, [parsed.fieldErrors]);
  }

  const profile = await StudentService.createStudentProfile(parsed.data);

  return Response.json(
    new ApiResponse(
      201,
      profile,
      "Student registered successfully"
    ),
    { status: 201 }
  );
});
