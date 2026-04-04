import connectDb from "@/lib/db/mongoose"
import { Student } from "@/lib/models/student.model"
import { User } from "@/lib/models/user.model"
import { ApiError } from "@/lib/util/apierror"
import { ApiResponse } from "@/lib/util/apiresponse"
import { asyncHandler } from "@/lib/util/apihandler"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { validateLoginInput } from "@/lib/validation/student";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieNameForRole,
} from "@/lib/auth";

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
      .select("userId")
      .lean()

    if (student?.userId) {
      user = await User.findById(student.userId)
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
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  } as const

  cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions)
  cookieStore.set(getAuthCookieNameForRole(user.role), token, cookieOptions)

  return Response.json(
    new ApiResponse(200,{ user: loggedInuser },"User has been logged in"),{ status: 200 }
  )
})
