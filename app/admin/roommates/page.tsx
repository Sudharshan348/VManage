import { redirect } from "next/navigation";

import { AdminRoommatesClient } from "@/components/admin-roommates-client";
import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminRoommatesPage() {
  const user = await getCurrentUser("admin");

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/student");
  }

  return (
    <DashboardShell title="Roommate matcher" role="admin" userName={user.name}>
      <Panel title="Find compatible roommates">
        <AdminRoommatesClient />
      </Panel>
    </DashboardShell>
  );
}
