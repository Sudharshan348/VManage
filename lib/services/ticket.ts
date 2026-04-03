import { TicketRepository } from "@/lib/repositories/ticket";
import { ApiError } from "@/lib/util/apierror";

export class TicketService {
  static async raiseTicket(data: any, studentId: string) {
    return TicketRepository.create({ ...data, studentId });
  }

  static async getMyTickets(studentId: string) {
    return TicketRepository.findByStudentId(studentId);
  }

  static async getAllTickets(page: number = 1, limit: number = 10) {
    return TicketRepository.findAll(page, limit);
  }

  static async updateTicket(ticketId: string, status: string, resolvedNote?: string) {
    const updatePayload: any = { status };
    if (status === "resolved" || status === "closed") {
      updatePayload.resolvedAt = new Date();
      if (resolvedNote) updatePayload.resolvedNote = resolvedNote;
    }
    
    const updated = await TicketRepository.updateStatus(ticketId, updatePayload);
    if (!updated) throw new ApiError(404, "Ticket not found");
    return updated;
  }
}