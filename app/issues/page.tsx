import { redirect } from "next/navigation";

import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { IssueForm } from "@/components/issue-form";
import { StudentComplaintsClient } from "@/components/student-complaints-client";
import { getCurrentStudentProfile } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { MaintenanceTicket } from "@/lib/models/issue.model";
import { Room } from "@/lib/models/room.model";

export default async function IssuesPage() {
  const profile = await getCurrentStudentProfile("student");

  if (!profile?.user) {
    redirect("/login");
  }

  if (profile.user.role !== "student" || !profile.student) {
    redirect("/admin");
  }

  let initialRoomNumber = "";
  let complaints: Array<{
    _id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    roomNumber: string;
    createdAt: string;
    resolvedNote?: string;
  }> = [];

  await connectDb();
  if (profile.student.roomId) {
    const room = await Room.findById(profile.student.roomId).select("roomNumber").lean();
    initialRoomNumber = room?.roomNumber ?? "";
  }

  complaints = await MaintenanceTicket.find({ studentId: profile.student._id })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean()
    .then((tickets) =>
      tickets.map((ticket) => ({
        _id: String(ticket._id),
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        roomNumber: ticket.roomNumber,
        createdAt: ticket.createdAt instanceof Date
          ? ticket.createdAt.toISOString()
          : String(ticket.createdAt),
        resolvedNote: ticket.resolvedNote,
      }))
    );

  return (
    <DashboardShell title="Your issues" role="student" userName={profile.user.name}>
      <Panel title="Raise a complaint">
        <IssueForm
          studentName={profile.user.name}
          rollNo={profile.student.rollNo}
          phone={profile.student.phone}
          initialRoomNumber={initialRoomNumber}
        />
      </Panel>

      <Panel title="Complaint status">
        <StudentComplaintsClient complaints={complaints} />
      </Panel>
    </DashboardShell>
  );
}
