import { redirect } from "next/navigation";

import { AdminComplaintsClient } from "@/components/admin-complaints-client";
import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { MaintenanceTicket } from "@/lib/models/issue.model";
import { Student } from "@/lib/models/student.model";
import { User } from "@/lib/models/user.model";

export default async function AdminComplaintsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  await connectDb();

  const complaintDocs = await MaintenanceTicket.find()
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const studentIds = Array.from(new Set(complaintDocs.map((ticket) => String(ticket.studentId))));
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

  const complaints = complaintDocs.map((ticket) => {
    const meta = studentMetaById.get(String(ticket.studentId));
    return {
      _id: String(ticket._id),
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      roomNumber: ticket.roomNumber,
      studentName: meta?.name || "Student",
      studentRollNo: meta?.rollNo || "N/A",
      createdAt: ticket.createdAt instanceof Date
        ? ticket.createdAt.toISOString()
        : String(ticket.createdAt),
      resolvedNote: ticket.resolvedNote,
    };
  });

  return (
    <DashboardShell title="Complaints" role="admin" userName={user.name}>
      <Panel title="Manage student complaints">
        <AdminComplaintsClient complaints={complaints} />
      </Panel>
    </DashboardShell>
  );
}
