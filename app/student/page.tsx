import { redirect } from "next/navigation";

import { DashboardCard, DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentStudentProfile } from "@/lib/auth";

function formatValue(value?: string | number | null) {
  return value ? String(value) : "Not provided";
}

function InfoItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : undefined}>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default async function StudentPage() {
  const profile = await getCurrentStudentProfile();

  if (!profile?.user) {
    redirect("/login");
  }

  if (profile.user.role !== "student") {
    redirect("/admin");
  }

  const student = profile.student;

  return (
    <DashboardShell title="Student dashboard" role="student" userName={profile.user.name}>
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Roll number" value={formatValue(student?.rollNo)} />
        <DashboardCard title="Course" value={formatValue(student?.course)} />
        <DashboardCard title="Year" value={formatValue(student?.year)} />
      </div>

      <Panel title="Your signup information">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoItem label="Full name" value={profile.user.name} />
          <InfoItem label="Email" value={profile.user.email} />
          <InfoItem label="Phone" value={student?.phone} />
          <InfoItem label="Status" value={student?.status} />
          <InfoItem label="Parent phone" value={student?.parentPhone} />
          <InfoItem label="Room assignment" value={student?.roomId?.toString()} />
          <InfoItem label="Address" value={student?.address} fullWidth />
        </div>
      </Panel>
    </DashboardShell>
  );
}
