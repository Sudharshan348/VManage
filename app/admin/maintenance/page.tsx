import { redirect } from "next/navigation";

import { AdminMaintenanceClient } from "@/components/admin-maintenance-client";
import { DashboardShell, Panel } from "@/components/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import connectDb from "@/lib/db/mongoose";
import { Asset } from "@/lib/models/assert.model";
import { PreventiveMaintenance } from "@/lib/models/maintenance.model";

export default async function AdminMaintenancePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "warden") {
    redirect("/student");
  }

  await connectDb();

  const [assets, maintenanceDocs] = await Promise.all([
    Asset.find()
      .select("assetType floor machineAge status lastMaintenance")
      .sort({ assetType: 1, floor: 1 })
      .lean(),
    PreventiveMaintenance.find({ fatal: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return (
    <DashboardShell title="Maintenance AI" role="admin" userName={user.name}>
      <Panel title="Run maintenance checker">
        <AdminMaintenanceClient
          assets={assets.map((asset) => ({
            _id: String(asset._id),
            assetType: asset.assetType,
            floor: asset.floor,
            machineAge: asset.machineAge,
            status: asset.status,
            lastMaintenance: asset.lastMaintenance instanceof Date
              ? asset.lastMaintenance.toISOString()
              : String(asset.lastMaintenance),
          }))}
          existingIssues={maintenanceDocs.map((issue) => ({
            _id: String(issue._id),
            assetIdentifier: issue.assetIdentifier,
            assetType: issue.assetType,
            floorLevel: issue.floorLevel,
            ageMonths: issue.ageMonths,
            daysSinceService: issue.daysSinceService,
            riskScore: issue.riskScore,
            status: issue.status,
            fatal: issue.fatal,
            createdAt: issue.createdAt instanceof Date
              ? issue.createdAt.toISOString()
              : String(issue.createdAt),
          }))}
        />
      </Panel>
    </DashboardShell>
  );
}
