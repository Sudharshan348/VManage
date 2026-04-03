import { getSessionPayload } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Notice } from "@/lib/models/notice.model";
import { ApiError } from "@/lib/util/apierror";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();

  const session = await getSessionPayload();
  if (!session || (session.role !== "admin" && session.role !== "warden")) {
    throw new ApiError(403, "Only faculty can post notices");
  }

  const body = (await req.json()) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "general";
  const expiresAt =
    typeof body.expiresAt === "string" && body.expiresAt
      ? new Date(body.expiresAt)
      : undefined;

  if (!title || !content) {
    throw new ApiError(400, "Title and content are required");
  }

  const notice = await Notice.create({
    title,
    content,
    category,
    postedBy: session._id,
    ...(expiresAt && !Number.isNaN(expiresAt.getTime()) ? { expiresAt } : {}),
  });

  return Response.json(
    new ApiResponse(201, notice, "Notice posted successfully"),
    { status: 201 }
  );
});
