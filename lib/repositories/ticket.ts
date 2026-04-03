import { MaintenanceTicket, IMaintenanceTicket } from "@/lib/models/issue.model";

export class TicketRepository {
  static async create(data: any): Promise<IMaintenanceTicket> {
    return MaintenanceTicket.create(data);
  }
  static async findByStudentId(studentId: string): Promise<IMaintenanceTicket[]> {
    return MaintenanceTicket.find({ studentId })
      .populate("roomId", "roomNumber block")
      .sort({ createdAt: -1 });
  }
  static async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      MaintenanceTicket.find()
        .populate("studentId", "name rollNo")
        .populate("roomId", "roomNumber block")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MaintenanceTicket.countDocuments()
    ]);

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
  static async updateStatus(id: string, updateData: any): Promise<IMaintenanceTicket | null> {
    return MaintenanceTicket.findByIdAndUpdate(id, updateData, { new: true });
  }
}