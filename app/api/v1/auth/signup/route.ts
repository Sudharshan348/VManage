import connectDb from "@/lib/db/mongoose";
import { Student } from "@/lib/models/student.model";
import { User } from "@/lib/models/user.model";
import { ApiError } from "@/lib/util/apierror";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import {
  validateStudentSignup,
  type StudentSignupPayload,
} from "@/lib/validation/student";

async function createStudentAccount(payload: StudentSignupPayload) {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const existingStudent = await Student.findOne({
    $or: [{ email: payload.email }, { rollNo: payload.rollNo }],
  });

  if (existingStudent) {
    throw new ApiError(409, "Student with this email or roll number already exists");
  }

  const student = await Student.create({
    name: payload.name,
    rollNo: payload.rollNo,
    email: payload.email,
    phone: payload.phone,
    course: payload.course,
    year: payload.year,
    parentPhone: payload.parentPhone,
    address: payload.address,
  });

  try {
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: "student",
      studentId: student._id,
    });

    const createdUser = await User.findById(user._id).select("-password").lean();

    return { student, user: createdUser };
  } catch (error) {
    await Student.findByIdAndDelete(student._id);
    throw error;
  }
}

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();

  const body = await req.json();
  const parsed = validateStudentSignup(body);

  if (!parsed.success) {
    return Response.json(
      {
        ...new ApiResponse(400, null, parsed.message),
        errors: parsed.fieldErrors,
      },
      { status: 400 }
    );
  }

  const result = await createStudentAccount(parsed.data);

  return Response.json(
    new ApiResponse(
      201,
      {
        user: result.user,
        student: result.student,
      },
      "Student registered successfully"
    ),
    { status: 201 }
  );
});
