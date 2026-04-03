import { redirect } from "next/navigation";
import type { ComponentProps } from "react";

import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { MaintenanceTicket } from "@/lib/models/issue.model";
import { Student } from "@/lib/models/student.model";
import { User } from "@/lib/models/user.model";
type TicketRow = ComponentProps<typeof AdminDashboardClient>["currentComplaints"][number];

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  await connectDb();

  const [openComplaintDocs, urgentMaintenanceDocs] = await Promise.all([
    MaintenanceTicket.find({ status: { $in: ["open", "in_progress"] } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    MaintenanceTicket.find({
      priority: { $in: ["high", "urgent"] },
      status: { $in: ["open", "in_progress"] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const studentIds = Array.from(
    new Set(
      [...openComplaintDocs, ...urgentMaintenanceDocs].map((ticket) =>
        String(ticket.studentId)
      )
    )
  );

  const studentDocs = await Student.find({ _id: { $in: studentIds } })
    .select("userId rollNo")
    .lean();
  const userIds = studentDocs.map((student) => student.userId).filter(Boolean);
  const userDocs = await User.find({ _id: { $in: userIds } }).select("name").lean();

  const userNameById = new Map(userDocs.map((item) => [String(item._id), item.name]));
  const studentMetaById = new Map(
    studentDocs.map((student) => [
      String(student._id),
      {
        rollNo: student.rollNo,
        name: userNameById.get(String(student.userId)) || "Student",
      },
    ])
  );

  const toTicketRows = (
    tickets: typeof openComplaintDocs
  ): TicketRow[] =>
    tickets.map((ticket) => {
      const meta = studentMetaById.get(String(ticket.studentId));
      return {
        _id: String(ticket._id),
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        studentName: meta?.name || "Student",
        studentRollNo: meta?.rollNo || "N/A",
      };
    });

  const openComplaints = toTicketRows(openComplaintDocs);
  const urgentMaintenance = toTicketRows(urgentMaintenanceDocs);

  return (
    <DashboardShell title="Faculty workspace" role="admin" userName={user.name}>
      <AdminDashboardClient
        currentComplaints={openComplaints}
        maintenanceIssues={urgentMaintenance}
      />
    </DashboardShell>
  );
}
