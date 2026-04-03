import { ApiError } from "@/lib/util/apierror"
import { ApiResponse } from "@/lib/util/apiresponse"

export const asyncHandler = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req)
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json(
          new ApiResponse(error.statusCode, null, error.message),
          { status: error.statusCode }
        )
      }
      return Response.json(
        new ApiResponse(500, null, "Internal server error"),
        { status: 500 }
      )
    }
  }
}