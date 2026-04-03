import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { StudentDashboardClient } from "@/components/student-dashboard-client";
import { getCurrentStudentProfile } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Room } from "@/lib/models/room.model";

export default async function StudentPage() {
  const profile = await getCurrentStudentProfile();

  if (!profile?.user) {
    redirect("/login");
  }

  if (profile.user.role !== "student") {
    redirect("/admin");
  }

  const student = profile.student;
  let roomLabel = "Not assigned";

  if (student?.roomId) {
    await connectDb();
    const room = await Room.findById(student.roomId).select("block roomNumber floor").lean();
    if (room) {
      roomLabel = `${room.block}-${room.roomNumber} • Floor ${room.floor}`;
    }
  }

  return (
    <DashboardShell title="Student dashboard" role="student" userName={profile.user.name}>
      <StudentDashboardClient
        profile={{
          name: profile.user.name,
          email: profile.user.email,
          rollNo: student?.rollNo,
          course: student?.course,
          year: student?.year,
          phone: student?.phone,
          status: student?.status,
          parentPhone: student?.parentPhone,
          address: student?.address,
          roomLabel,
        }}
      />
    </DashboardShell>
  );
}
