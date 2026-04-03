import connectDb from "@/lib/db/mongoose"
import { User } from "@/lib/models/user.model"
import { ApiError } from "@/lib/util/apierror"
import { ApiResponse } from "@/lib/util/apiresponse"
import { asyncHandler } from "@/lib/util/apihandler"

export const POST = asyncHandler(async (req: Request) => {
  await connectDb()

  const body = await req.json()
  const { name, email, password, role } = body

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email, and password are required")
  }

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists")
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "student"
  })

  const createdUser = await User.findById(user._id).select("-password")

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return Response.json(
    new ApiResponse(201, createdUser, "User registered successfully"),
    { status: 201 }
  )
})