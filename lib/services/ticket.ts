import { TicketRepository, type TicketWritePayload } from "@/lib/repositories/ticket";
import { MaintenanceTicket } from "@/lib/models/issue.model";
import { ApiError } from "@/lib/util/apierror";

export class TicketService {
  static async raiseTicket(data: TicketWritePayload, studentId: string) {
    return TicketRepository.create({ ...data, studentId });
  }

  static async getMyTickets(studentId: string) {
    return TicketRepository.findByStudentId(studentId);
  }

  static async getAllTickets(page: number = 1, limit: number = 10) {
    return TicketRepository.findAll(page, limit);
  }

  static async reopenTicket(ticketId: string, data: TicketWritePayload, studentId: string) {
    const existingTicket = await MaintenanceTicket.findOne({
      _id: ticketId,
      studentId,
    });

    if (!existingTicket) {
      throw new ApiError(404, "Issue not found");
    }

    if (existingTicket.status !== "resolved" && existingTicket.status !== "closed") {
      throw new ApiError(400, "Only resolved or closed issues can be raised again");
    }

    const reopened = await TicketRepository.updateStatus(ticketId, {
      ...data,
      status: "open",
      resolvedAt: null,
      resolvedNote: "",
    });

    if (!reopened) throw new ApiError(404, "Ticket not found");
    return reopened;
  }

  static async reopenTicketWithExistingDetails(ticketId: string, studentId: string) {
    const existingTicket = await MaintenanceTicket.findOne({
      _id: ticketId,
      studentId,
    }).lean();

    if (!existingTicket) {
      throw new ApiError(404, "Issue not found");
    }

    if (existingTicket.status !== "resolved" && existingTicket.status !== "closed") {
      throw new ApiError(400, "Only resolved or closed issues can be raised again");
    }

    const reopened = await TicketRepository.updateStatus(ticketId, {
      roomId: existingTicket.roomId,
      roomNumber: existingTicket.roomNumber,
      title: existingTicket.title,
      description: existingTicket.description,
      category: existingTicket.category,
      priority: existingTicket.priority,
      status: "open",
      resolvedAt: null,
      resolvedNote: "",
    });

    if (!reopened) throw new ApiError(404, "Ticket not found");
    return reopened;
  }

  static async updateTicket(ticketId: string, status: string, resolvedNote?: string) {
    const updatePayload: TicketWritePayload = { status };
    if (status === "resolved" || status === "closed") {
      updatePayload.resolvedAt = new Date();
      if (resolvedNote) updatePayload.resolvedNote = resolvedNote;
    } else {
      updatePayload.resolvedAt = null;
      updatePayload.resolvedNote = "";
    }

    const updated = await TicketRepository.updateStatus(ticketId, updatePayload);
    if (!updated) throw new ApiError(404, "Ticket not found");
    return updated;
  }
}
