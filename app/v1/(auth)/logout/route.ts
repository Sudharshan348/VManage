import { ApiResponse } from "@/lib/Utils/apiresponse"
import { asyncHandler } from "@/lib/Utils/apihandler"
import { cookies } from "next/headers"

export const POST = asyncHandler(async (req: Request) => {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")

  return Response.json(
    new ApiResponse(200, {}, "User Logged Out"),
    { status: 200 }
  )
})