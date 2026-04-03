import { redirect } from "next/navigation";

import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { IssueForm } from "@/components/issue-form";
import { getCurrentStudentProfile } from "@/lib/auth";

export default async function IssuesPage() {
  const profile = await getCurrentStudentProfile();

  if (!profile?.user) {
    redirect("/login");
  }

  if (profile.user.role !== "student" || !profile.student) {
    redirect("/admin");
  }

  return (
    <DashboardShell title="Student dashboard" role="student" userName={profile.user.name}>
      <Panel title="Raise issue">
        <IssueForm
          studentName={profile.user.name}
          rollNo={profile.student.rollNo}
          phone={profile.student.phone}
          roomAssigned={Boolean(profile.student.roomId)}
        />
      </Panel>
    </DashboardShell>
  );
}
