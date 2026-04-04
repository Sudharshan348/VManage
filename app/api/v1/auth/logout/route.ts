import { ApiResponse } from "@/lib/util/apiresponse"
import { asyncHandler } from "@/lib/util/apihandler"
import { cookies } from "next/headers"
import { ADMIN_AUTH_COOKIE_NAME, AUTH_COOKIE_NAME, STUDENT_AUTH_COOKIE_NAME } from "@/lib/auth"

export const POST = asyncHandler(async () => {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
  cookieStore.delete(STUDENT_AUTH_COOKIE_NAME)
  cookieStore.delete(ADMIN_AUTH_COOKIE_NAME)

  return Response.json(
    new ApiResponse(200, {}, "User Logged Out"),
    { status: 200 }
  )
})
