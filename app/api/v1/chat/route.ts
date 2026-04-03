import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { ApiError } from "@/lib/util/apierror";
import { getSessionPayload } from "@/lib/auth";
import { ChatService } from "@/lib/services/chat";

export const POST = asyncHandler(async (req: Request) => {
  const session = await getSessionPayload();

  if (!session) {
    throw new ApiError(401, "Unauthorized request. Please log in.");
  }

  const body = await req.json();
  const { question } = body;

  if (!question || typeof question !== "string" || question.trim() === "") {
    throw new ApiError(400, "A valid question is required");
  }

  const chatData = await ChatService.askQuestion(question.trim());

  return Response.json(
    new ApiResponse(200, chatData, "Chat response generated successfully"),
    { status: 200 }
  );
});