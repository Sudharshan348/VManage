import { ApiResponse } from "@/lib/util/apiresponse"
import { asyncHandler } from "@/lib/util/apihandler"
import { cookies } from "next/headers"

export const POST = asyncHandler(async (req: Request) => {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")

  return Response.json(
    new ApiResponse(200, {}, "User Logged Out"),
    { status: 200 }
  )
})