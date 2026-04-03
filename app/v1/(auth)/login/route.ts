import connectDb from "@/lib/db/mongoose"
import { User } from "@/lib/models/user.model"
import { ApiError } from "@/lib/Utils/apierror"
import { ApiResponse } from "@/lib/Utils/apiresponse"
import { asyncHandler } from "@/lib/Utils/apihandler"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

export const POST = asyncHandler(async (req: Request) => {

  await connectDb()
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(400, "User not found")
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
    new ApiResponse(200,{ user: loggedInuser },"User has been logged In"),{ status: 200 }
  )
})