import { redirect } from "next/navigation";

import { IssueForm } from "@/components/issue-form";
import { PortalShell, SectionCard } from "@/components/v1-portal";
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
    <PortalShell title="Raise issue" eyebrow="Support" accent="green">
      <SectionCard title="Submit ticket" subtitle="Stored against the maintenance schema">
        <IssueForm
          studentName={profile.student.name}
          rollNo={profile.student.rollNo}
          phone={profile.student.phone}
          roomAssigned={Boolean(profile.student.roomId)}
        />
      </SectionCard>
    </PortalShell>
  );
}
