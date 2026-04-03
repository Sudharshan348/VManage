import connectDb from "@/lib/db/mongoose"
import { Student } from "@/lib/models/student.model"
import { User } from "@/lib/models/user.model"
import { ApiError } from "@/lib/util/apierror"
import { ApiResponse } from "@/lib/util/apiresponse"
import { asyncHandler } from "@/lib/util/apihandler"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { validateLoginInput } from "@/lib/validation/student";

export const POST = asyncHandler(async (req: Request) => {

  await connectDb()
  const body = await req.json()
  const parsed = validateLoginInput(body)

  if (!parsed.success) {
    return Response.json(
      {
        ...new ApiResponse(400, null, parsed.message),
        errors: parsed.fieldErrors,
      },
      { status: 400 }
    )
  }

  const { identifier, password } = parsed.data
  let user = await User.findOne({ email: identifier })

  if (!user) {
    const student = await Student.findOne({ rollNo: identifier.toUpperCase() })
      .select("email")
      .lean()

    if (student?.email) {
      user = await User.findOne({ email: student.email.toLowerCase() })
    }
  }

  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const checkpwd = await user.comparePassword(password)
  if (!checkpwd) {
    throw new ApiError(401, "Invalid password")
  }

  const token = jwt.sign(
    { _id: user._id, role: user.role },
    process.env.JWT_SECRET || "hackathon_secret_key",
    { expiresIn: "7d" }
  )
  
  const loggedInuser = await User.findById(user._id).select("-password")
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7 
  })

  return Response.json(
    new ApiResponse(200,{ user: loggedInuser },"User has been logged in"),{ status: 200 }
  )
})
