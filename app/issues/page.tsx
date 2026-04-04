import { redirect } from "next/navigation";

import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { IssueForm } from "@/components/issue-form";
import { getCurrentStudentProfile } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Room } from "@/lib/models/room.model";

export default async function IssuesPage() {
  const profile = await getCurrentStudentProfile();

  if (!profile?.user) {
    redirect("/login");
  }

  if (profile.user.role !== "student" || !profile.student) {
    redirect("/admin");
  }

  let initialRoomNumber = "";

  if (profile.student.roomId) {
    await connectDb();
    const room = await Room.findById(profile.student.roomId).select("roomNumber").lean();
    initialRoomNumber = room?.roomNumber ?? "";
  }

  return (
    <DashboardShell title="Student dashboard" role="student" userName={profile.user.name}>
      <Panel title="Raise issue">
        <IssueForm
          studentName={profile.user.name}
          rollNo={profile.student.rollNo}
          phone={profile.student.phone}
          initialRoomNumber={initialRoomNumber}
        />
      </Panel>
    </DashboardShell>
  );
}
