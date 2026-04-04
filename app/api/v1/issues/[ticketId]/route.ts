import connectDb from "@/lib/db/mongoose";
import { getSessionPayload } from "@/lib/auth";
import { MaintenanceTicket } from "@/lib/models/issue.model";
import { TicketService } from "@/lib/services/ticket";
import { validateTicketUpdate } from "@/lib/validation/issue";
import { ApiError } from "@/lib/util/apierror";
import { ApiResponse } from "@/lib/util/apiresponse";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getSessionPayload();

    if (!session || (session.role !== "admin" && session.role !== "warden")) {
      throw new ApiError(403, "Only admin or warden can update complaint status");
    }

    await connectDb();

    const { ticketId } = await context.params;
    const ticket = await MaintenanceTicket.findById(ticketId).select("_id");

    if (!ticket) {
      throw new ApiError(404, "Complaint not found");
    }

    const body = await req.json();
    const validation = validateTicketUpdate(body);

    if (!validation.success) {
      throw new ApiError(400, validation.message);
    }

    const updatedTicket = await TicketService.updateTicket(
      ticketId,
      validation.data.status,
      validation.data.resolvedNote
    );

    return Response.json(
      new ApiResponse(200, updatedTicket, "Complaint status updated successfully"),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        new ApiResponse(error.statusCode, null, error.message),
        { status: error.statusCode }
      );
    }

    console.error("Unhandled API error:", error);

    return Response.json(
      new ApiResponse(500, null, "Internal server error"),
      { status: 500 }
    );
  }
}
