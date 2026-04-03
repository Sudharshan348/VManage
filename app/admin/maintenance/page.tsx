import { redirect } from "next/navigation";

import { AdminMaintenanceClient } from "@/components/admin-maintenance-client";
import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Asset } from "@/lib/models/assert.model";

export default async function AdminMaintenancePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  await connectDb();

  const assets = await Asset.find()
    .select("assetType floor machineAge status")
    .sort({ assetType: 1, floor: 1 })
    .lean();

  return (
    <DashboardShell title="Maintenance AI" role="admin" userName={user.name}>
      <Panel title="Predict preventive maintenance risk">
        <AdminMaintenanceClient
          assets={assets.map((asset) => ({
            _id: String(asset._id),
            assetType: asset.assetType,
            floor: asset.floor,
            machineAge: asset.machineAge,
            status: asset.status,
          }))}
        />
      </Panel>
    </DashboardShell>
  );
}
