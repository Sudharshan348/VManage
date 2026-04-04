import { redirect } from "next/navigation";

import { AdminRoomInventoryClient } from "@/components/admin-room-inventory-client";
import { DashboardShell } from "@/components/dashboard-shell";
import { AdminRoomForm } from "@/components/admin-room-form";
import { getCurrentUser } from "@/lib/auth";
import { Panel } from "@/components/dashboard-shell";

export default async function AdminRoomPage() {
  const user = await getCurrentUser("admin");

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  return (
    <DashboardShell title="Room inventory" role="admin" userName={user.name}>
      <Panel title="Add a room">
        <AdminRoomForm />
      </Panel>
      <AdminRoomInventoryClient />
    </DashboardShell>
  );
}
