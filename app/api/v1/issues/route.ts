import { getCurrentStudentProfile } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { ApiError } from "@/lib/util/apierror";
import { asyncHandler } from "@/lib/util/apihandler";
import { ApiResponse } from "@/lib/util/apiresponse";
import { TicketService } from "@/lib/services/ticket";

const allowedCategories = new Set([
  "plumbing",
  "electrical",
  "furniture",
  "cleaning",
  "internet",
  "other",
]);
const allowedPriorities = new Set(["low", "medium", "high", "urgent"]);

export const POST = asyncHandler(async (req: Request) => {
  await connectDb();

  const profile = await getCurrentStudentProfile();
  if (!profile?.user || profile.user.role !== "student" || !profile.student) {
    throw new ApiError(403, "Only students can raise issues");
  }

  if (!profile.student.roomId) {
    throw new ApiError(400, "Room assignment is required before raising an issue");
  }

  const body = (await req.json()) as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const priority = typeof body.priority === "string" ? body.priority.trim() : "";

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  if (!allowedCategories.has(category)) {
    throw new ApiError(400, "Invalid category");
  }

  if (!allowedPriorities.has(priority)) {
    throw new ApiError(400, "Invalid priority");
  }

  const ticket = await TicketService.raiseTicket({
    roomId: profile.student.roomId,
    title,
    description,
    category,
    priority,
  }, String(profile.student._id));

  return Response.json(
    new ApiResponse(201, ticket, "Issue raised successfully"),
    { status: 201 }
  );
});
